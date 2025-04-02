import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Review, ReviewDocument } from '../common/models/schema/review.schema';
import { Model } from 'mongoose';
import {
  CreateReviewDto,
  UpdateReviewDto,
} from '../common/models/dto/review.dto';
import { PaginationSet } from '../common/models/response';
import {
  UserInformation,
  UserInformationDocument,
} from '../common/models/schema/user-info.schema';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name)
    private reviewModel: Model<ReviewDocument>,
    @InjectModel(UserInformation.name)
    private uiModel: Model<UserInformationDocument>,
  ) {}

  async creatReview(userId: string, data: CreateReviewDto): Promise<Review> {
    const existingReview = await this.reviewModel.findOne({
      userId,
      productId: data.productId,
      orderId: data.orderId,
    });
    if (existingReview) {
      throw new BadRequestException(
        'Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi.',
      );
    }

    const review = new this.reviewModel({ userId, ...data });
    await review.save();

    return review;
  }

  async getProductReviews(
    productId: string,
    page: number,
    limit: number,
  ): Promise<PaginationSet<Review>> {
    const skip = (page - 1) * limit;
    const [data, totalItems] = await Promise.all([
      this.reviewModel.find({ productId }).skip(skip).limit(limit).exec(),
      this.reviewModel.countDocuments({ productId }).exec(),
    ]);

    const userIds = data.map((r) => r.userId);

    const users = await this.uiModel
      .find({ userId: { $in: userIds } })
      .select('userId fullName')
      .exec();

    const userMap = new Map(users.map((u) => [u.userId, u.fullName]));

    const enrichedReviews = data.map((r) => ({
      ...r.toObject(),
      fullName: userMap.get(r.userId) || 'Người dùng ẩn danh',
    }));

    return new PaginationSet(totalItems, page, limit, enrichedReviews);
  }

  async getReviewDetail(userId: string) {
    const review = await this.reviewModel.findById(userId);
    if (!review) {
      throw new NotFoundException('Không tìm thấy đánh giá.');
    }
    return review;
  }

  async updateReview(userId: string, data: UpdateReviewDto): Promise<Review> {
    const review = await this.reviewModel.findOneAndUpdate(
      { _id: userId },
      { $set: data },
      { new: true },
    );
    if (!review) {
      throw new NotFoundException(
        'Không tìm thấy đánh giá hoặc bạn không có quyền chỉnh sửa.',
      );
    }
    return review;
  }

  async deleteReview(userId: string): Promise<any> {
    const result = await this.reviewModel.findOneAndDelete({ _id: userId });
    if (!result) {
      throw new NotFoundException(
        'Không tìm thấy đánh giá hoặc bạn không có quyền xoá.',
      );
    }
    return { message: 'Đã xoá đánh giá thành công.' };
  }
}
