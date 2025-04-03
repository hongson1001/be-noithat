import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CustomerMailerService } from '../common/utils/customer-mailer/customer-mailer.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../common/models/schema/order.schema';
import {
  OrderItem,
  OrderItemSchema,
} from '../common/models/schema/order-item.schema';
import { Product, ProductSchema } from '../common/models/schema/product.schema';
import { Voucher, VoucherSchema } from '../common/models/schema/voucher.schema';
import { User, UserSchema } from '../common/models/schema/user.schema';
import { Cart, CartSchema } from '../common/models/schema/cart.schema';
import { Review, ReviewSchema } from '../common/models/schema/review.schema';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      secret:
        process.env.ADMIN_SECRET_KEY ||
        process.env.USER_SECRET_KEY ||
        'default_secret',
      signOptions: {
        expiresIn: '24h',
      },
    }),
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderItem.name, schema: OrderItemSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Voucher.name, schema: VoucherSchema },
      { name: User.name, schema: UserSchema },
      { name: Cart.name, schema: CartSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, CustomerMailerService],
})
export class OrderModule {}
