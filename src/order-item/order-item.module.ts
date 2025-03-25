import { Module } from '@nestjs/common';
import { OrderItemService } from './order-item.service';
import { OrderItemController } from './order-item.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

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
  ],
  controllers: [OrderItemController],
  providers: [OrderItemService],
})
export class OrderItemModule {}
