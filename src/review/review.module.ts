import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from '../common/models/schema/review.schema';

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
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
