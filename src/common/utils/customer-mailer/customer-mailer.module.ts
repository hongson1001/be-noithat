import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomerMailerService } from './customer-mailer.service';
import { CustomerMailerController } from './customer-mailer.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('EMAIL_HOST'),
          port: parseInt(config.get<string>('EMAIL_PORT'), 10),
          secure: config.get<string>('EMAIL_SECURE') === 'true',
          auth: {
            user: config.get<string>('EMAIL_USER'),
            pass: config.get<string>('EMAIL_PASS'),
          },
        },
        defaults: {
          from: config.get<string>('EMAIL_FROM'),
        },
      }),
    }),
  ],
  controllers: [CustomerMailerController],
  providers: [CustomerMailerService],
  exports: [CustomerMailerService],
})
export class CustomerMailerModule {}
