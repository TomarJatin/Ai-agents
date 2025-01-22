import { Body, Controller, Post } from '@nestjs/common';
import { ContentGeneratorService } from './content-generator.service';
import {
  ContentGenerationRequest,
  GeneratedContent,
} from './content-generator.types';

@Controller('content-generator')
export class ContentGeneratorController {
  constructor(
    private readonly contentGeneratorService: ContentGeneratorService,
  ) {}

  @Post('generate')
  async generateContent(
    @Body() request: ContentGenerationRequest,
  ): Promise<GeneratedContent> {
    return this.contentGeneratorService.generateContent(request);
  }
}
