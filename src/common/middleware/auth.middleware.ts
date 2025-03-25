import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) return false;

    try {
      let payload;
      try {
        payload = this.jwtService.verify(token, {
          secret: process.env.USER_SECRET_KEY,
        });
        request.user = payload;
        return true;
      } catch (error) {
        payload = this.jwtService.verify(token, {
          secret: process.env.ADMIN_SECRET_KEY,
        });
        request.user = payload;
        return true;
      }
    } catch (error) {
      return false;
    }
  }
}
