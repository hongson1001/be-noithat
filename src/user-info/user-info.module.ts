import { Module } from '@nestjs/common';
import { UserInfoService } from './user-info.service';
import { UserInfoController } from './user-info.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserInformation,
  UserInformationSchema,
} from '../common/models/schema/user-info.schema';
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
        expiresIn: '24h',
      },
    }),
    MongooseModule.forFeature([
      { name: UserInformation.name, schema: UserInformationSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [UserInfoController],
  providers: [UserInfoService],
})
export class UserInfoModule {}
