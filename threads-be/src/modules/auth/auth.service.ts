import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthResponse, TokenPayload } from './interfaces/auth.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { HashUtil } from 'src/common/utils/hash.util';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}
  async signup(signupDto: SignUpDto): Promise<AuthResponse> {
    const { email, username, password } = signupDto;
    try {
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      const existingUser = await this.prismaService.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      });

      if (existingUser) {
        if (existingUser.email === email) {
          throw new Error('Email already exists');
        }
        if (existingUser.username === username) {
          throw new Error('Username already exists');
        }
      }
      const passwordHash = await HashUtil.hash(password);

      const user = await this.prismaService.user.create({
        data: {
          email,
          username,
          passwordHash,
          displayName: username,
        },
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          avatarUrl: true,
        },
      });

      const tokenPayload: TokenPayload = {
        userId: user.id,
        username: user.username,
        email: user.email,
      };

      const accessToken = this.generateAccessToken(tokenPayload);
      const refreshToken = this.generateRefreshToken(tokenPayload);

      // Save refresh token to DB
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      await this.prismaService.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt,
        },
      });

      return {
        user,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
    }
    throw new InternalServerErrorException('An ');
  }

  private generateAccessToken(payload: TokenPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('config.jwt.secret'),
      expiresIn: this.configService.get('config.jwt.expiresIn'),
    });
  }

  private generateRefreshToken(payload: TokenPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('config.jwt.refreshSecret'),
      expiresIn: this.configService.get('config.jwt.refreshExpiresIn'),
    });
  }

  async validateUser(userId: string) {
    return this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        verified: true,
      },
    });
  }
}
