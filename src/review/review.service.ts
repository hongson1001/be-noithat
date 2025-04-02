import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Review, ReviewDocument } from '../common/models/schema/review.schema';
import { Model } from 'mongoose';
import { CreateReviewDto } from '../common/models/dto/review.dto';
import { PaginationSet } from '../common/models/response';
import {
  UserInformation,
  UserInformationDocument,
} from '../common/models/schema/user-info.schema';
import { Order, OrderDocument } from '../common/models/schema/order.schema';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name)
    private reviewModel: Model<ReviewDocument>,
    @InjectModel(UserInformation.name)
    private uiModel: Model<UserInformationDocument>,
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
  ) {}

  async creatReview(userId: string, data: CreateReviewDto): Promise<Review[]> {
    // Tìm đơn hàng của user
    const order = await this.orderModel
      .findOne({ _id: data.orderId, userId })
      .exec();

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng.');
    }

    // Kiểm tra xem đơn hàng đã được giao thành công chưa
    if (order.status !== 'delivered') {
      throw new BadRequestException(
        'Đơn hàng chưa giao thành công, không thể đánh giá.',
      );
    }

    // Lấy danh sách các sản phẩm trong đơn hàng
    const orderProductIds = order.items.map((item) =>
      item.productId.toString(),
    );

    // Kiểm tra các sản phẩm được gửi trong request có nằm trong đơn hàng không
    for (const review of data.reviews) {
      if (!orderProductIds.includes(review.productId)) {
        throw new BadRequestException(
          `Sản phẩm ${review.productId} không thuộc đơn hàng này.`,
        );
      }
    }

    // Kiểm tra xem sản phẩm đã được đánh giá chưa
    const existingReviews = await this.reviewModel.find({
      userId,
      orderId: data.orderId,
      productId: { $in: data.reviews.map((r) => r.productId) },
    });

    const reviewedProductIds = existingReviews.map((r) =>
      r.productId.toString(),
    );

    for (const review of data.reviews) {
      if (reviewedProductIds.includes(review.productId)) {
        throw new BadRequestException(
          `Bạn đã đánh giá sản phẩm ${review.productId} trong đơn hàng này rồi.`,
        );
      }
    }

    // Lưu đánh giá cho từng sản phẩm đủ điều kiện
    const newReviews = data.reviews.map((reviewData) => ({
      userId,
      orderId: data.orderId,
      productId: reviewData.productId,
      rating: reviewData.rating,
      comment: reviewData.comment,
    }));

    return await this.reviewModel.insertMany(newReviews);
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

  // async updateReview(userId: string, data: UpdateReviewDto): Promise<Review> {
  //   const review = await this.reviewModel.findOneAndUpdate(
  //     { _id: userId },
  //     { $set: data },
  //     { new: true },
  //   );
  //   if (!review) {
  //     throw new NotFoundException(
  //       'Không tìm thấy đánh giá hoặc bạn không có quyền chỉnh sửa.',
  //     );
  //   }
  //   return review;
  // }

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
