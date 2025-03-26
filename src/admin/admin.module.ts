import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from '../common/models/schema/admin.schema';
import { TokenBlacklist } from '../common/models/schema/tokenblacklist.schema.ts';
import { TokenBlacklistService } from '../common/utils/tokenblacklist/tokenblacklist.service';

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
      { name: Admin.name, schema: AdminSchema },
      { name: TokenBlacklist.name, schema: TokenBlacklist },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, TokenBlacklistService],
})
export class AdminModule {}
