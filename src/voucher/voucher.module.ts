import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { VoucherController } from './voucher.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Voucher, VoucherSchema } from '../common/models/schema/voucher.schema';

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
    MongooseModule.forFeature([{ name: Voucher.name, schema: VoucherSchema }]),
  ],
  controllers: [VoucherController],
  providers: [VoucherService],
})
export class VoucherModule {}
