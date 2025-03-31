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
        process.env.ADMIN_SECRET_KEY ||
        process.env.USER_SECRET_KEY ||
        'default_secret',
      signOptions: {
        expiresIn: '24h',
      },
    }),
  ],
  controllers: [OrderItemController],
  providers: [OrderItemService],
})
export class OrderItemModule {}
