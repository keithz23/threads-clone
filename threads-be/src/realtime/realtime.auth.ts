import { Socket } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';

export type JWTPayload = JwtPayload & {
  sub: string;
  email?: string;
  role?: string;
};

function getTokenFromClient(client: Socket): string | null {
  // 1) Qua auth token
  const fromAuth = client.handshake.auth?.token as string | undefined;
  if (fromAuth) return fromAuth;

  // 2) Qua header Authorization: Bearer ...
  const authz = client.handshake.headers?.authorization as string | undefined;
  if (authz?.startsWith('Bearer ')) return authz.slice(7);

  // 3) (tuỳ chọn) Cookie (nếu bạn set JWT trong cookie)
  const cookie = client.handshake.headers?.cookie as string | undefined;
  if (cookie) {
    const m = cookie
      .split(';')
      .map((s) => s.trim())
      .find((s) => s.startsWith('access_token='));
    if (m) return m.split('=')[1];
  }
  return null;
}

export function verifySocketJWT(client: Socket): {
  userId: string;
  payload: JWTPayload;
} {
  const token = getTokenFromClient(client);
  if (!token) throw new Error('Missing token');

  const payload = jwt.verify(token, process.env.JWT_SECRET!, {
    algorithms: ['HS256'],
    // issuer: 'your-issuer',       // nếu dùng
    // audience: 'your-audience',   // nếu dùng
    clockTolerance: 5, // giây cho lệch đồng hồ nhẹ
  }) as JWTPayload;

  const userId = payload.sub;
  if (!userId) throw new Error('Invalid token payload (missing sub)');
  return { userId, payload };
}
