import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('query')
  async queryEmails(@Body('query') query: string) {
    return this.emailService.queryEmails(query);
  }

  @Post('compose')
  async composeEmail(@Body('prompt') prompt: string) {
    return this.emailService.composeEmail(prompt);
  }
}
