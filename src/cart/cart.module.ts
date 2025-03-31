import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from '../common/models/schema/cart.schema';
import { Product, ProductSchema } from '../common/models/schema/product.schema';
import { User, UserSchema } from '../common/models/schema/user.schema';

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
      { name: Cart.name, schema: CartSchema },
      { name: Product.name, schema: ProductSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
