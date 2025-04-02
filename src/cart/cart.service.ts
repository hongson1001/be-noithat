import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cart, CartDocument } from '../common/models/schema/cart.schema';
import { Model } from 'mongoose';
import {
  Product,
  ProductDocument,
} from '../common/models/schema/product.schema';
import { AddToCartDto, UpdateCartItemDto } from '../common/models/dto/cart.dto';
import { Types } from 'mongoose';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private cartModel: Model<CartDocument>,
    @InjectModel(Product.name)
    private proModel: Model<ProductDocument>,
  ) {}

  async addToCart(userId: string, data: AddToCartDto): Promise<Cart> {
    let cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      cart = new this.cartModel({ userId, items: [] });
    }

    const productIds = data.items.map((item) => item.productId);
    const products = await this.proModel.find({ _id: { $in: productIds } });

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    for (const item of data.items) {
      const product = productMap.get(item.productId);
      if (!product) throw new NotFoundException('Không thấy sản phẩm');
      if (product.quantity < item.quantity)
        throw new BadRequestException('Không đủ hàng');

      const cartItem = cart.items.find((i) => i.productId === item.productId);
      if (cartItem) {
        if (product.quantity < cartItem.quantity + item.quantity) {
          throw new BadRequestException('Không đủ hàng để thêm số lượng');
        }
        cartItem.quantity += item.quantity;
      } else {
        cart.items.push({ productId: item.productId, quantity: item.quantity });
      }
      product.quantity -= item.quantity;
    }

    await Promise.all(products.map((product) => product.save()));
    await cart.save();
    return cart;
  }

  async getCart(userId: string): Promise<any> {
    const cart = await this.cartModel
      .findOne({ userId })
      .populate({
        path: 'items.productId',
        select: 'name price images quantity size material',
      })
      .lean();

    if (!cart) throw new NotFoundException('Cart not found');

    // Lọc bỏ các item có productId là null
    cart.items = cart.items.filter((item) => item.productId);

    // Tính tổng giá tiền
    const totalPrice = cart.items.reduce((sum, item) => {
      const product = item.productId as any;
      return sum + (product.price || 0) * item.quantity;
    }, 0);

    return { ...cart, totalPrice };
  }

  async updateCartItem(userId: string, data: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) throw new NotFoundException('Cart not found');

    const cartItem = cart.items.find(
      (item) => item.productId.toString() === data.productId,
    );
    if (!cartItem) throw new NotFoundException('Item not found in cart');

    const product = await this.proModel.findById(cartItem.productId);
    if (!product) throw new NotFoundException('Product not found');

    const quantityChange = data.quantity - cartItem.quantity;
    if (quantityChange > 0 && product.quantity < quantityChange) {
      throw new BadRequestException('Not enough stock');
    }

    cartItem.quantity = data.quantity;
    product.quantity -= quantityChange;
    await product.save();
    await cart.save();
    return cart;
  }

  async removeCartItem(userId: string, productId: string): Promise<any> {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      throw new NotFoundException('Không tìm thấy giỏ hàng');
    }

    const productIdObj = new Types.ObjectId(productId);

    const cartItem = cart.items.find((item) =>
      new Types.ObjectId(item.productId).equals(productIdObj),
    );

    if (!cartItem)
      throw new NotFoundException('Sản phẩm không có trong giỏ hàng');

    const product = await this.proModel.findById(cartItem.productId);
    if (product) {
      product.quantity += cartItem.quantity;
      await product.save();
    }

    cart.items = cart.items.filter(
      (item) => !new Types.ObjectId(item.productId).equals(productIdObj),
    );

    await cart.save();
    return cart;
  }

  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      throw new NotFoundException('Không tìm thấy giỏ hàng');
    }

    await Promise.all(
      cart.items.map(async (item) => {
        const product = await this.proModel.findById(item.productId);
        if (product) {
          product.quantity += item.quantity;
          await product.save();
        }
      }),
    );

    cart.items = [];
    await cart.save();
    return cart;
  }
}
