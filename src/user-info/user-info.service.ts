import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  UserInformation,
  UserInformationDocument,
} from '../common/models/schema/user-info.schema';
import { Model } from 'mongoose';
import { User, UserDocument } from '../common/models/schema/user.schema';
import { PaginationSet } from '../common/models/response';
import {
  AddressDto,
  UpdateUserInformationDto,
} from '../common/models/dto/user-info.dto';

@Injectable()
export class UserInfoService {
  constructor(
    @InjectModel(UserInformation.name)
    private readonly uiModel: Model<UserInformationDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  //#region UserInfomation
  async updateUserInformation(
    userId: string,
    updateUserInformationDto: UpdateUserInformationDto,
  ): Promise<any> {
    const checkUser = await this.userModel.findOne({ _id: userId });
    if (!checkUser) {
      throw new NotFoundException('Không thấy tài khoản');
    }

    const userInformation = await this.uiModel.findOneAndUpdate(
      { userId },
      { $set: updateUserInformationDto },
      { new: true },
    );
    if (!userInformation) {
      throw new NotFoundException(` Không tìm thấy thông tin người dùng `);
    }

    return userInformation;
  }

  async getUserInfoByUser(userId: string): Promise<UserInformation> {
    const userInfo = await this.uiModel.findOne({ userId }).exec();
    if (!userInfo) {
      throw new NotFoundException('Không thấy tài khoản');
    }

    return userInfo;
  }
  //#endregion

  //#region Address
  async addAddress(userId: string, addressDto: AddressDto): Promise<any> {
    const userInfo = await this.uiModel.findOne({ userId });
    if (!userInfo) {
      throw new NotFoundException('Không tìm thấy thông tin người dùng');
    }

    if (addressDto.isDefault) {
      await this.uiModel.updateOne(
        { userId, 'address.isDefault': true },
        { $set: { 'address.$[].isDefault': false } },
      );
    }

    const updatedUserInfo = await this.uiModel.findOneAndUpdate(
      { userId },
      { $push: { address: addressDto } },
      { new: true },
    );

    return updatedUserInfo;
  }

  async listAddress(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginationSet<any>> {
    const userInfo = await this.uiModel.findOne({ userId });
    if (!userInfo) {
      throw new NotFoundException('Không tìm thấy thông tin người dùng');
    }

    const skip = (page - 1) * limit;
    const totalItems = userInfo.address.length;

    const addresses = userInfo.address.slice(skip, skip + limit);

    return new PaginationSet(totalItems, page, limit, addresses);
  }
  //#endregion
}
