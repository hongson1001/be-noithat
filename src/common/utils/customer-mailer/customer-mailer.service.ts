import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomerMailerService {
  constructor(
    private readonly mailerService: NestMailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendMail(options: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }) {
    const { to, subject, text, html } = options;

    if (!to || to.trim() === '') {
      console.error('🚨 Lỗi: Email người nhận không hợp lệ:', to);
      throw new Error('Không thể gửi mail: email người nhận không hợp lệ.');
    }

    try {
      await this.mailerService.sendMail({
        to,
        subject,
        text,
        html,
        from: this.configService.get('EMAIL_FROM'),
      });
    } catch (error) {
      console.error('KHông thể gửi mail: ', error);
      throw new Error('Không thể gửi mail');
    }
  }
}
