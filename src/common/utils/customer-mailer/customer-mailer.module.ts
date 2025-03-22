import { Module } from '@nestjs/common';
import { CustomerMailerService } from './customer-mailer.service';
import { CustomerMailerController } from './customer-mailer.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('EMAIL_HOST'),
          port: parseInt(config.get('EMAIL_PORT'), 10),
          secure: config.get('EMAIL_SECURE') === 'true',
          auth: {
            user: config.get('EMAIL_USER'),
            pass: config.get('EMAIL_PASS'),
          },
        },
        defaults: {
          from: config.get('EMAIL_FROM'),
        },
      }),
    }),
  ],
  controllers: [CustomerMailerController],
  providers: [CustomerMailerService],
  exports: [CustomerMailerService],
})
export class CustomerMailerModule {}
