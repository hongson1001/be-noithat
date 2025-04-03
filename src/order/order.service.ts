import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from '../common/models/schema/order.schema';
import { Model } from 'mongoose';
import {
  OrderItem,
  OrderItemDocument,
} from '../common/models/schema/order-item.schema';
import {
  Product,
  ProductDocument,
} from '../common/models/schema/product.schema';
import { CustomerMailerService } from '../common/utils/customer-mailer/customer-mailer.service';
import { ConfigService } from '@nestjs/config';
import { CreateOrderDto } from '../common/models/dto/order.dto';
import {
  Voucher,
  VoucherDocument,
} from '../common/models/schema/voucher.schema';
import { User, UserDocument } from '../common/models/schema/user.schema';
import { PaginationSet } from '../common/models/response';
import { Cart, CartDocument } from '../common/models/schema/cart.schema';
import { Review, ReviewDocument } from '../common/models/schema/review.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    @InjectModel(OrderItem.name)
    private oiModel: Model<OrderItemDocument>,
    @InjectModel(Product.name)
    private proModel: Model<ProductDocument>,
    @InjectModel(Voucher.name)
    private voucherModel: Model<VoucherDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Cart.name)
    private cartModel: Model<CartDocument>,
    @InjectModel(Review.name)
    private reviewModel: Model<ReviewDocument>,

    private readonly mailerService: CustomerMailerService,
    private readonly configService: ConfigService,
  ) {}

  //Áp dụng voucher
  async applyVoucher(
    userId: string,
    voucherId: string,
    totalPrice: number,
  ): Promise<number> {
    const voucher = await this.voucherModel.findById(voucherId);
    if (!voucher) throw new NotFoundException('Không tìm thấy voucher');
    if (
      !voucher.isActive ||
      (voucher.expiryDate && new Date() > voucher.expiryDate)
    ) {
      throw new BadGatewayException('Voucher đã hết hạn');
    }
    if (totalPrice < voucher.minOrderValue) {
      throw new BadGatewayException(
        'Giá trị đơn hàng quá thấp cho phiếu giảm giá này',
      );
    }

    const discountAmount = voucher.isPercentage
      ? (totalPrice * voucher.discount) / 100
      : voucher.discount;
    return totalPrice - discountAmount;
  }

  async createOrder(userId: string, data: CreateOrderDto): Promise<any> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản');

    let totalPrice = 0;

    const productUpdates = data.items.map(async (item) => {
      const product = await this.proModel.findById(item.productId);
      if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
      if (product.quantity < item.quantity)
        throw new BadGatewayException('Số lượng sản phẩm không đủ');

      product.quantity -= item.quantity;
      await product.save();

      totalPrice += product.price * item.quantity;

      return new this.oiModel({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    });

    const items = await Promise.all(productUpdates);

    if (data.voucherId) {
      const voucher = await this.voucherModel.findById(data.voucherId);
      if (!voucher || !voucher.isActive)
        throw new BadGatewayException('Voucher không hợp lệ');
      if (voucher.expiryDate && new Date() > voucher.expiryDate)
        throw new BadGatewayException('Voucher đã quá hạn');
      if (voucher.quantity <= 0)
        throw new BadGatewayException('Voucher đã hết lượt sử dụng');
      if (totalPrice < voucher.minOrderValue)
        throw new BadGatewayException(
          'Giá trị đơn hàng chưa đủ để áp dụng voucher',
        );

      const discountAmount = voucher.isPercentage
        ? (totalPrice * voucher.discount) / 100
        : voucher.discount;
      totalPrice -= discountAmount;
      voucher.quantity -= 1;
      await voucher.save();
    }

    const order = new this.orderModel({
      userId,
      items,
      voucherId: data.voucherId,
      totalPrice,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      note: data.note,
      status: 'pending',
    });
    await order.save();

    await this.cartModel.updateOne(
      { userId },
      {
        $pull: {
          items: {
            productId: { $in: data.items.map((item) => item.productId) },
          },
        },
      },
    );

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Đặt hàng thành công',
        text: `Mã đơn hàng: ${order._id}`,
      });
    } catch (error) {
      console.error('Lỗi gửi email:', error.message);
    }

    return order;
  }

  //LẤy danh sách order của admin
  async listOrrder(page: number, limit: number): Promise<PaginationSet<Order>> {
    const skip = (page - 1) * limit;

    const [data, totalItems] = await Promise.all([
      this.orderModel
        .find()
        .skip(skip)
        .limit(limit)
        .populate('userId', 'email')
        .populate('items')
        .exec(),
      this.orderModel.countDocuments().exec(),
    ]);

    const formattedOrders = data.map((order) => ({
      ...order.toObject(),
      userEmail: (order.userId as any)?.email || 'N/A',
    }));

    return new PaginationSet(page, limit, totalItems, formattedOrders);
  }

  async getUserOrders(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginationSet<Order>> {
    const skip = (page - 1) * limit;

    const [data, totalItems] = await Promise.all([
      this.orderModel
        .find({ userId })
        .skip(skip)
        .limit(limit)
        .populate('items')
        .exec(),
      this.orderModel.countDocuments({ userId }).exec(),
    ]);

    const ordersWithReviewStatus = await Promise.all(
      data.map(async (order) => {
        const orderProductIds = order.items.map((item) =>
          item.productId._id.toString(),
        );

        const existingReviews = await this.reviewModel.find({
          userId,
          orderId: order._id.toString(),
          productId: { $in: orderProductIds },
        });

        const isReviewed = existingReviews.length === order.items.length;

        return {
          ...order.toObject(),
          isReviewed,
        };
      }),
    );
    return new PaginationSet(page, limit, totalItems, ordersWithReviewStatus);
  }

  //Lấy chi tiết đơn hàng
  async detail(orderId: string): Promise<Order> {
    const order = await this.orderModel
      .findById(orderId)
      .populate('items')
      .exec();
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    return order;
  }

  //Admin cập nhập trạng thái đơn hàng
  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const order = await this.orderModel
      .findById(orderId)
      .populate('items')
      .exec();
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    order.status = status;
    await order.save();
    return order;
  }

  //User huỷ đơn hàng
  async cancelOrder(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderModel.findOne({ _id: orderId, userId });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    if (order.status !== 'pending') {
      throw new BadGatewayException(
        'Không thể hủy đơn hàng đã xác nhận hoặc đã giao',
      );
    }

    order.status = 'cancelled';
    await order.save();
    return order;
  }

  //User nhận hàng
  async confirmOrderReceived(userId: string, orderId: string): Promise<Order> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản');

    const order = await this.orderModel.findOne({ _id: orderId, userId });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    if (order.status !== 'completed') {
      await Promise.all(
        order.items.map(async (item) => {
          await this.proModel.findByIdAndUpdate(item.productId, {
            $inc: {
              sold: item.quantity,
            },
          });
        }),
      );
    }

    order.status = 'completed';
    await order.save();

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Gia đơn hàng thành công',
      text: ` Đơn hàng có mã: ${orderId} đã được giao thành công. Vui lòng vào đánh giá sản phẩm. `,
    });

    return order;
  }
}
