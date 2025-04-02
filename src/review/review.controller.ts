import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from '../common/models/dto/review.dto';
import {
  ErrorResponseModel,
  ResponseContentModel,
} from '../common/models/response';
import { AuthGuard } from '../common/middleware/auth.middleware';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(AuthGuard)
  async creatReview(@Request() req: any, @Body() data: CreateReviewDto) {
    try {
      const userId = req.user?.sub;

      const response = await this.reviewService.creatReview(userId, data);

      return new ResponseContentModel(201, 'Đánh giá thành công', response);
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  // @Patch()
  // @UseGuards(AuthGuard)
  // async updateReview(@Request() req: any, @Body() data: UpdateReviewDto) {
  //   try {
  //     const userId = req.user?.sub;

  //     const response = await this.reviewService.updateReview(userId, data);

  //     return new ResponseContentModel(200, 'Sửa đánh giá thành công', response);
  //   } catch (error) {
  //     return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
  //       [(error as Error).message || 'Unknown error occurred'],
  //     ]);
  //   }
  // }

  @Get('product/:productId')
  @UseGuards(AuthGuard)
  async getProductReviews(
    @Param('productId') productId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    try {
      const response = await this.reviewService.getProductReviews(
        productId,
        page,
        limit,
      );

      return new ResponseContentModel(
        200,
        'Lấy danh sấch đánh giá thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  async getReviewDetail(@Request() req: any) {
    try {
      const userId = req.user?.sub;

      const response = await this.reviewService.getReviewDetail(userId);

      return new ResponseContentModel(
        200,
        'Lấy danh sấch đánh giá thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Delete()
  @UseGuards(AuthGuard)
  async deleteReview(@Request() req: any) {
    try {
      const userId = req.user?.sub;

      const response = await this.reviewService.deleteReview(userId);

      return new ResponseContentModel(
        200,
        'Lấy danh sấch đánh giá thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }

  @Get('check-reviewed')
  @UseGuards(AuthGuard)
  async checkReviewed(
    @Request() req,
    @Query('orderId') orderId: string,
    @Query('productId') productId?: string,
  ) {
    try {
      const userId = req.user?.sub;

      const response = await this.reviewService.checkReviewed(
        userId,
        orderId,
        productId,
      );

      return new ResponseContentModel(
        200,
        'Lấy danh sấch đánh giá thành công',
        response,
      );
    } catch (error) {
      return new ErrorResponseModel(500, 'Có lỗi trong quá trình xử lý', [
        [(error as Error).message || 'Unknown error occurred'],
      ]);
    }
  }
}
