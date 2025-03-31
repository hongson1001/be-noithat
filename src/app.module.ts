import * as dotenv from 'dotenv';

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TokenblacklistModule } from './common/utils/tokenblacklist/tokenblacklist.module';
import { LocationModule } from './common/utils/location/location.module';
import { CustomerMailerModule } from './common/utils/customer-mailer/customer-mailer.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenBlacklistMiddleware } from './common/middleware/token-blacklist.middleware';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { UserInfoModule } from './user-info/user-info.module';
import { BlogModule } from './blog/blog.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { OrderItemModule } from './order-item/order-item.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { VoucherModule } from './voucher/voucher.module';
import { ReviewModule } from './review/review.module';
import { StatisticalModule } from './statistical/statistical.module';

dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DATABASE_URI),

    TokenblacklistModule,
    LocationModule,
    CustomerMailerModule,
    AdminModule,
    UserModule,
    UserInfoModule,
    BlogModule,
    CartModule,
    OrderModule,
    OrderItemModule,
    CategoryModule,
    ProductModule,
    VoucherModule,
    ReviewModule,
    StatisticalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TokenBlacklistMiddleware).forRoutes('*');
  }
}
