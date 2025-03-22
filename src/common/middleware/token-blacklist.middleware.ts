import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { TokenBlacklistService } from '../utils/tokenblacklist/tokenblacklist.service';

@Injectable()
export class TokenBlacklistMiddleware implements NestMiddleware {
  constructor(private readonly tokenBlacklistService: TokenBlacklistService) {}

  async use(req: any, res: any, next: () => void) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return next();
    }

    const token = authHeader.split(' ')[1]; // Lấy token từ "Bearer <token>"
    if (!token) {
      return next();
    }

    const isBlacklisted =
      await this.tokenBlacklistService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new ForbiddenException('Yêu cầu đăng nhập');
    }

    next();
  }
}
