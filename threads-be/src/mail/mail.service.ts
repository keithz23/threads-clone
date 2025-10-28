import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { createHash } from 'crypto';
import { SendMailDto } from './dto/send-mail.dto';

@Injectable()
export class MailService {
  constructor(@InjectQueue('mail') private readonly mailQueue: Queue) {}

  private makeJobId(payload: SendMailDto) {
    const raw = `${payload.to}|${payload.type}|${JSON.stringify(payload.context)}`;
    return createHash('sha256').update(raw).digest('hex');
  }

  async enqueue(payload: SendMailDto) {
    return this.mailQueue.add('send', payload, {
      jobId: this.makeJobId(payload),
      priority: 1,
    });
  }

  // Các helper tiện dụng:
  async sendVerifyEmail(to: string, token: string, name?: string) {
    return this.enqueue({
      to,
      type: 'verify',
      subject: 'Verify your email',
      context: { token, name },
    });
  }

  async sendResetEmail(
    to: string,
    token: string,
    username?: string,
    expiresInMinutes: number = 60,
  ) {
    let expiresIn: string;
    if (expiresInMinutes < 60) {
      expiresIn = `${expiresInMinutes} minutes`;
    } else if (expiresInMinutes === 60) {
      expiresIn = '1 hour';
    } else {
      const hours = Math.floor(expiresInMinutes / 60);
      expiresIn = `${hours} hours`;
    }

    return this.enqueue({
      to,
      type: 'reset',
      subject: 'Reset your password',
      context: {
        token,
        username: username || 'there',
        expiresIn,
      },
    });
  }
}
