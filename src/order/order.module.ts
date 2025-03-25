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

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      secret:
        process.env.USER_SECRET_KEY && process.env.ADMIN_SECRET_KEY
          ? undefined
          : process.env.USER_SECRET_KEY || process.env.ADMIN_SECRET_KEY,
      signOptions: {
        expiresIn: '1h',
      },
    }),
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderItem.name, schema: OrderItemSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Voucher.name, schema: VoucherSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, CustomerMailerService],
})
export class OrderModule {}
