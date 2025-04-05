import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../common/models/schema/user.schema';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../common/models/schema/order.schema';
import {
  Product,
  ProductDocument,
} from '../common/models/schema/product.schema';
import * as moment from 'moment-timezone';

@Injectable()
export class StatisticalService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private proModel: Model<ProductDocument>,
  ) {}

  //Thống kê số lượng user theo tháng
  async getUserStatistics(month: number, year: number): Promise<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const totalDays = new Date(year, month, 0).getDate();

    const users = await this.userModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dayOfMonth: '$createdAt',
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    const fullData = Array.from({ length: totalDays }, (_, i) => ({
      _id: i + 1,
      count: users.find((u) => u._id === i + 1)?.count || 0,
    }));

    return fullData;
  }

  //thống kê số lượng sản phẩm nhập vào theo tháng
  async getProductStatistics(month: number, year: number): Promise<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const totalDays = new Date(year, month, 0).getDate();

    const products = await this.proModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const fullData = Array.from({ length: totalDays }, (_, i) => ({
      _id: i + 1,
      count: products.find((p) => p._id === i + 1)?.count || 0,
    }));

    return fullData;
  }

  // Thống kê tổng số sản phẩm hiện có
  async getTotalProductsByMonthYear(month: number, year: number): Promise<any> {
    const startDate = new Date(year, month - 1, 1); // Ngày đầu tháng
    const endDate = new Date(year, month, 0, 23, 59, 59); // Ngày cuối tháng

    const productStats = await this.proModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }, // Lọc theo tháng và năm
        },
      },
      {
        $group: {
          _id: { month, year },
          total: { $sum: 1 }, // Tổng số sản phẩm
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          inactive: {
            $sum: { $cond: [{ $eq: ['$status', 'unactive'] }, 1, 0] },
          },
          outOfStock: { $sum: { $cond: [{ $eq: ['$quantity', 0] }, 1, 0] } },
        },
      },
    ]);

    return productStats.length
      ? productStats[0]
      : {
          _id: { month, year },
          total: 0,
          active: 0,
          unactive: 0,
          outOfStock: 0,
        };
  }

  //Thống kê đơn hàng theo trạng thái
  async getOrderStatistics(month: number, year: number): Promise<any> {
    const orders = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(year, month - 1, 1), // Ngày bắt đầu tháng
            $lt: new Date(year, month, 1), // Ngày đầu tiên của tháng kế tiếp
          },
        },
      },
      {
        $group: {
          _id: '$status', // Nhóm theo trạng thái đơn hàng
          count: { $sum: 1 }, // Đếm số lượng đơn hàng
        },
      },
    ]);

    return orders;
  }

  //Thống kê doanh thu theo ngày, tuần tháng
  async getRevenueStatistics(date: string) {
    const startOfMonth = moment(date).startOf('month').toDate();
    const endOfMonth = moment(date).endOf('month').toDate();

    const orders = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          status: 'completed', // Bạn có thể thay đổi điều kiện theo yêu cầu
          totalPrice: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalRevenue: { $sum: '$totalPrice' },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: '$_id',
          totalRevenue: 1,
          totalOrders: 1,
        },
      },
      {
        $sort: { month: 1 }, // Sắp xếp theo tháng
      },
    ]);

    const labels = [];
    const data = [];

    // Kiểm tra nếu có dữ liệu và trả về doanh thu của tháng
    if (orders.length > 0) {
      labels.push(`Tháng ${orders[0].month}`);
      data.push(orders[0].totalRevenue);
    } else {
      labels.push(`Tháng ${moment(date).month() + 1}`);
      data.push(0);
    }

    return {
      labels,
      data,
    };
  }
}
