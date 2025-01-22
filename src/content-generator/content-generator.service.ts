import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from '../openai/openai.service';
import { ResearchAgentService } from '../research-agent/research-agent.service';
import {
  ContentGenerationRequest,
  ContentType,
  GeneratedContent,
} from './content-generator.types';

@Injectable()
export class ContentGeneratorService {
  private readonly logger = new Logger(ContentGeneratorService.name);

  constructor(
    private readonly openAIService: OpenAIService,
    private readonly researchAgentService: ResearchAgentService,
  ) {}

  async generateContent(
    request: ContentGenerationRequest,
  ): Promise<GeneratedContent> {
    console.log('generating content...');
    try {
      // Step 1: Research the topic
      const researchData = await this.researchAgentService.researchContent(
        request.topic,
        request.contentType,
      );

      // Step 2: Generate content based on research
      const generatedContent: GeneratedContent = {};

      // Generate text content if needed
      if (
        request.contentType === ContentType.TEXT ||
        request.contentType === ContentType.TEXT_AND_IMAGE
      ) {
        generatedContent.text = await this.generateTextContent(
          request,
          researchData,
        );
      }

      // Generate image if needed
      if (
        request.contentType === ContentType.IMAGE ||
        request.contentType === ContentType.TEXT_AND_IMAGE
      ) {
        generatedContent.imageUrl = await this.generateImageContent(
          request,
          researchData,
        );
      }

      return generatedContent;
    } catch (error) {
      this.logger.error(`Error generating content: ${error}`);
      throw error;
    }
  }

  private async generateTextContent(
    request: ContentGenerationRequest,
    researchData: string,
  ): Promise<string> {
    const prompt = `
      Using the following research data as context:
      ${researchData}

      Generate engaging content about "${request.topic}" with these specifications:
      - Tone: ${request.tone || 'professional'}
      - Target Audience: ${request.targetAudience || 'general'}
      - Additional Context: ${request.additionalContext || 'none'}

      The content should be well-structured, engaging, and incorporate insights from the research.
      Include relevant statistics and examples where appropriate.
      
      Format the response in a clear, readable way.
    `;

    return await this.openAIService.getCompletion(prompt);
  }

  private async generateImageContent(
    request: ContentGenerationRequest,
    researchData: string,
  ): Promise<string> {
    // First, generate an optimal image prompt based on the research
    const imagePromptGenerationPrompt = `
      Based on this research data:
      ${researchData}

      Create a detailed image generation prompt for "${request.topic}" that:
      1. Captures the key visual elements
      2. Specifies the style and mood
      3. Includes relevant details about composition
      4. Considers the target audience: ${request.targetAudience || 'general'}

      Format as a clear, detailed DALL-E prompt.
    `;

    const imagePrompt = await this.openAIService.getCompletion(
      imagePromptGenerationPrompt,
    );

    // Generate the image using the optimized prompt
    return await this.openAIService.generateImage(imagePrompt);
  }
}
