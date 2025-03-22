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
    const items = [];

    for (const item of data.items) {
      const product = await this.proModel.findById(item.productId);
      if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
      if (product.quantity < item.quantity) {
        throw new BadGatewayException('Số lượng sản phẩm không đủ');
      }

      product.quantity -= item.quantity;
      await product.save();

      items.push(
        new this.oiModel({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        }),
      );
      totalPrice += product.price * item.quantity;
    }

    if (data.voucherId) {
      const voucher = await this.voucherModel.findById(data.voucherId);
      if (!voucher) throw new NotFoundException('Không tìm thấy voucher');
      if (
        !voucher.isActive ||
        (voucher.expiryDate && new Date() > voucher.expiryDate)
      ) {
        throw new BadGatewayException('Voucher đã quá hạn');
      }
      if (voucher.quantity <= 0) {
        throw new BadGatewayException('Voucher đã hết lượt sử dụng');
      }
      if (totalPrice < voucher.minOrderValue) {
        throw new BadGatewayException('Giá trị đơn hàng chưa đủ');
      }

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

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Đặt hàng thành công',
      text: `Đơn hàng của bạn đã được đặt thành công với mã đơn hàng: ${order._id}. Vui lòng theo dõi đơn hàng để biết thông tin chi tiết.`,
    });

    if (data.paymentMethod === 'bank_transfer') {
      const bankName = this.configService.get('BANK_NAME');
      const bankNumber = this.configService.get('BANK_NUMBER');
      const bankAccountName = this.configService.get('BANK_ACCOUNT_NAME');

      return {
        order,
        bankInfo: {
          bankName,
          bankNumber,
          bankAccountName,
          totalPrice,
        },
      };
    }

    return order;
  }

  //LẤy danh sách order của admin
  async listOrrder(page: number, limit: number): Promise<PaginationSet<Order>> {
    const skip = (page - 1) * limit;

    const [data, totalItems] = await Promise.all([
      this.orderModel.find().skip(skip).limit(limit).populate('items').exec(),
      this.orderModel.countDocuments().exec(),
    ]);

    return new PaginationSet(totalItems, page, limit, data);
  }

  //Lấy danh sách đơn hàng cho user
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

    return new PaginationSet(totalItems, page, limit, data);
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
}
