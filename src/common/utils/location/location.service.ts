import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LocationService {
  constructor() {}

  private readonly API_URL = 'https://provinces.open-api.vn/api';

  async getProvinces() {
    try {
      const response = await axios.get(`${this.API_URL}/p`);
      return response.data;
    } catch (error: any) {
      throw new Error('Không thể lấy danh sách tỉnh/thành: ' + error.message);
    }
  }

  async getDistricts(provinceCode: number) {
    try {
      const response = await axios.get(
        `${this.API_URL}/p/${provinceCode}?depth=2`,
      );
      return response.data.districts;
    } catch (error: any) {
      throw new Error('Không thể lấy danh sách quận/huyện: ' + error.message);
    }
  }

  async getWards(districtCode: number) {
    try {
      const response = await axios.get(
        `${this.API_URL}/d/${districtCode}?depth=2`,
      );
      return response.data.wards;
    } catch (error: any) {
      throw new Error('Không thể lấy danh sách xã/phường: ' + error.message);
    }
  }
}
