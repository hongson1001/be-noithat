import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../common/models/schema/user.schema';
import {
  TokenBlacklist,
  TokenBlacklistSchema,
} from '../common/models/schema/tokenblacklist.schema.ts';
import {
  UserInformation,
  UserInformationSchema,
} from '../common/models/schema/user-info.schema';
import { TokenBlacklistService } from '../common/utils/tokenblacklist/tokenblacklist.service';
import { CustomerMailerService } from '../common/utils/customer-mailer/customer-mailer.service';

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
      { name: User.name, schema: UserSchema },
      { name: TokenBlacklist.name, schema: TokenBlacklistSchema },
      { name: UserInformation.name, schema: UserInformationSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, TokenBlacklistService, CustomerMailerService],
})
export class UserModule {}
