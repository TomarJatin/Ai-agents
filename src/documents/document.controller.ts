import { Controller, Post, Body, Get, Query, Param, Put } from '@nestjs/common';
import { DocsService } from './document.service';

@Controller('docs')
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @Get('search')
  async searchDocuments(@Query('query') query: string) {
    return this.docsService.searchDocuments(query);
  }

  @Post('create')
  async createDocument(@Body('prompt') prompt: string) {
    return this.docsService.createDocument(prompt);
  }

  @Put(':id')
  async updateDocument(
    @Param('id') id: string,
    @Body('prompt') prompt: string,
  ) {
    return this.docsService.updateDocument(id, prompt);
  }

  @Post('drawing')
  async createDrawing(@Body('prompt') prompt: string) {
    return this.docsService.createDrawing(prompt);
  }
}
