import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request) => {
          return request?.cookies?.token || null;
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'secret-key'),
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub || payload.id,
      email: payload.email,
      fullName: payload.fullName,
      mobile: payload.mobile,
      role: payload.role,
    };
  }
}