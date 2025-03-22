import { Controller, Get, Param } from '@nestjs/common';
import { LocationService } from './location.service';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('provinces')
  async getProvinces() {
    return await this.locationService.getProvinces();
  }

  @Get('districts/:provinceCode')
  async getDistricts(@Param('provinceCode') provinceCode: number) {
    return await this.locationService.getDistricts(provinceCode);
  }

  @Get('wards/:districtCode')
  async getWards(@Param('districtCode') districtCode: number) {
    return await this.locationService.getWards(districtCode);
  }
}
