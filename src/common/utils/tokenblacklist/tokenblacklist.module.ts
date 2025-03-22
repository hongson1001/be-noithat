import { Module } from '@nestjs/common';
import { TokenblacklistController } from './tokenblacklist.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TokenBlacklist,
  TokenBlacklistSchema,
} from '../../models/schema/tokenblacklist.schema.ts';
import { TokenBlacklistService } from './tokenblacklist.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      { name: TokenBlacklist.name, schema: TokenBlacklistSchema },
    ]),
  ],
  controllers: [TokenblacklistController],
  providers: [TokenBlacklistService],
  exports: [TokenBlacklistService],
})
export class TokenblacklistModule {}
