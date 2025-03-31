import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../common/models/schema/user.schema';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../common/models/schema/order.schema';
import {
  Product,
  ProductDocument,
} from '../common/models/schema/product.schema';

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
  async getRevenueStatistics(type: 'day' | 'week' | 'month', date: string) {
    let startDate: Date, endDate: Date, groupFormat: any;

    if (type === 'day') {
      // 📅 Thống kê theo giờ trong ngày (từ 0:00 đến 23:59)
      startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0); // Đưa về 0:00
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999); // Đưa về 23:59
      groupFormat = { $hour: '$createdAt' }; // Nhóm theo giờ
    } else if (type === 'week') {
      // 📅 Thống kê theo ngày trong tuần
      startDate = new Date(date);
      const dayOfWeek = startDate.getDay(); // Lấy thứ trong tuần

      if (dayOfWeek === 0) {
        startDate.setDate(startDate.getDate() - 6);
      } else {
        startDate.setDate(startDate.getDate() - dayOfWeek + 1);
      }

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      groupFormat = { $dayOfMonth: '$createdAt' };
    } else {
      // 📅 Thống kê theo ngày trong tháng
      const [year, month] = date.split('-').map(Number);
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 1);
      groupFormat = { $dayOfMonth: '$createdAt' };
    }

    // 🔍 Truy vấn doanh thu
    const revenue = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: groupFormat, // Nhóm theo giờ/ngày
          totalRevenue: { $sum: '$totalPrice' },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 🔄 Chuẩn hóa dữ liệu để tránh thiếu giờ/ngày nào đó
    const labels = [];
    const data = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const key =
        type === 'day' ? currentDate.getHours() : currentDate.getDate();
      const found = revenue.find((r) => r._id === key);

      labels.push(type === 'day' ? `${key}:00` : `Ngày ${key}`);
      data.push(found ? found.totalRevenue : 0);

      if (type === 'day') {
        currentDate.setHours(currentDate.getHours() + 1);
      } else {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return {
      labels,
      data,
    };
  }
}
