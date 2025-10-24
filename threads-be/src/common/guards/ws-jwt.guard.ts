import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const client = context.switchToWs().getClient();
      const token =
        client.handshake?.auth?.token ||
        client.handshake?.headers?.authorization?.split(' ')[1];

      if (!token) {
        throw new WsException('Unauthorized');
      }

      const payload = this.jwtService.verify(token);
      context.switchToWs().getData().user = payload;
      return true;
    } catch (err) {
      throw new WsException('Unauthorized');
    }
  }
}
