import { Controller } from '@nestjs/common';
import { CustomerMailerService } from './customer-mailer.service';

@Controller('customer-mailer')
export class CustomerMailerController {
  constructor(private readonly customerMailerService: CustomerMailerService) {}
}
