import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const cookieToken = request.cookies?.token;
    const authHeader = request.headers.authorization;


    if (cookieToken && !authHeader) {
      request.headers.authorization = `Bearer ${cookieToken}`;
    }

    if (authHeader && !authHeader.startsWith('Bearer ') && authHeader.length > 50) {
      request.headers.authorization = `Bearer ${authHeader}`;
    }

    if (authHeader && authHeader.startsWith('Bearer%20')) {
      request.headers.authorization = authHeader.replace('Bearer%20', 'Bearer ');
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') throw new UnauthorizedException('توکن منقضی شده است');
      if (info?.name === 'JsonWebTokenError') throw new UnauthorizedException('توکن نامعتبر است');
      if (info?.name === 'NotBeforeError') throw new UnauthorizedException('توکن هنوز معتبر نیست');
      throw new UnauthorizedException('دسترسی غیرمجاز');
    }

    this.logger.debug(`User ${user.id || user.email} authenticated`);
    return user;
  }
}