import { Controller } from '@nestjs/common';
import { TokenBlacklistService } from './tokenblacklist.service';

@Controller('tokenblacklist')
export class TokenblacklistController {
  constructor(private readonly tokenblacklistService: TokenBlacklistService) {}
}
