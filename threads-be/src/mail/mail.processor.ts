import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import { SendMailDto } from './dto/send-mail.dto';
import { resolveTemplatePath } from 'src/common/utils/assets_path.util';
import { Logger } from '@nestjs/common';

@Processor('mail', { concurrency: 5 })
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);
  private transporter: nodemailer.Transporter;
  private templateCache = new Map<string, HandlebarsTemplateDelegate>();
  private readonly appUrl: string;
  private readonly fromAddress: string;

  constructor(private readonly cfg: ConfigService) {
    super();

    this.appUrl =
      this.cfg.get<string>('config.client.url') || 'http://localhost:5173';
    this.fromAddress = this.cfg.get<string>('config.mail.user') || '';

    this.transporter = nodemailer.createTransport({
      host: this.cfg.get<string>('config.mail.host'),
      port: Number(this.cfg.get('config.mail.port') || 465),
      secure: String(this.cfg.get('config.mail.secure') || 'true') === 'true',
      auth: {
        user: this.fromAddress,
        pass: this.cfg.get<string>('config.mail.password'),
      },
    });

    // Preload templates
    this.loadTemplate('verify');
    this.loadTemplate('reset');
    this.loadTemplate('welcome');
  }

  private loadTemplate(name: string): void {
    try {
      const file = resolveTemplatePath(name);
      const source = fs.readFileSync(file, 'utf8');
      this.templateCache.set(name, Handlebars.compile(source));
    } catch (error) {
      this.logger.error(`Failed to load template ${name}:`, error);
    }
  }

  private renderTemplate(name: string, context: Record<string, any>): string {
    const template = this.templateCache.get(name);
    if (!template) {
      throw new Error(`Template ${name} not found in cache`);
    }
    return template(context);
  }

  async process(job: Job<SendMailDto, any, string>) {
    const { to, type, context } = job.data;

    try {
      let subject = job.data.subject;
      let html = '';

      switch (type) {
        case 'verify':
          subject ||= 'Verify your email';
          html = this.renderTemplate('verify', {
            ...context,
            verifyUrl: `${this.appUrl}/verify?token=${context.token}`,
          });
          break;

        case 'reset':
          subject ||= 'Reset your password';
          html = this.renderTemplate('reset', {
            ...context,
            resetUrl: `${this.appUrl}/reset?token=${context.token}`,
          });
          break;

        case 'welcome':
        default:
          subject ||= 'Welcome!';
          html = this.renderTemplate('welcome', context);
          break;
      }

      await this.transporter.sendMail({
        from: `"App" <${this.fromAddress}>`,
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent successfully to ${to}`);
      return { ok: true };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Mail job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Mail job ${job?.id} failed: ${err.message}`, err.stack);
  }
}
