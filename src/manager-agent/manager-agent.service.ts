import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from '../openai/openai.service';

@Injectable()
export class ExecutiveDirectorService {
  private readonly logger = new Logger(ExecutiveDirectorService.name);

  constructor(private readonly openAIService: OpenAIService) {}

  async processInput(message: string): Promise<string> {
    console.log('processing input...', message);
    try {
      const analysis = await this.analyzeUserInput(message);
      console.log('Analysis:', analysis);

      switch (analysis.primaryIntent) {
        case 'communication':
          return await this.handleCommunicationTasks(message, analysis);
        case 'research':
          return await this.handleResearchTasks(message, analysis);
        case 'content_generation':
          return await this.handleContentTasks(message, analysis);
        default:
          return await this.getDefaultResponse(message);
      }
    } catch (error) {
      this.logger.error(`Error processing input: ${error}`);
      return 'Sorry, I encountered an error while processing your request.';
    }
  }

  private async analyzeUserInput(input: string) {
    const prompt = `
# Context
You are an Executive Director AI that manages multiple specialized agent teams.

# Available Teams
1. Communication Team: Handles emails, messaging, and other communication tasks
2. Research Team: Conducts market research and other research activities
3. Content Generation Team: Creates various types of content
4. Default Response Team: Handles general queries and simple responses

# Input
User message: "${input}"

# Task
Analyze the input and determine:
1. Which team should handle this request (communication, research, content_generation, or default)
2. What specific task needs to be performed
3. Key parameters and requirements

Respond with JSON only:
{
  "primaryIntent": string, // One of: communication, research, content_generation, default
  "task": string,
  "parameters": object
}`;

    const response = await this.openAIService.getCompletion(prompt);
    return JSON.parse(response.replace(/```json\n?|\n?```/g, '').trim());
  }

  private async handleCommunicationTasks(
    message: string,
    analysis: any,
  ): Promise<string> {
    this.logger.log('handling communication tasks...');
    console.log('handling communication tasks...', message, analysis);
    return 'Communication task handling';
  }

  private async handleResearchTasks(
    message: string,
    analysis: any,
  ): Promise<string> {
    this.logger.log('handling research tasks...');
    console.log('handling research tasks...', message, analysis);
    return 'Research task handling';
  }

  private async handleContentTasks(
    message: string,
    analysis: any,
  ): Promise<string> {
    this.logger.log('handling content tasks...');
    console.log('handling content tasks...', message, analysis);
    return 'Content task handling';
  }

  private async getDefaultResponse(message: string): Promise<string> {
    this.logger.log('getting default response...');
    const prompt = `
# Context
You are a helpful AI assistant providing simple responses to general queries.

# Input
User message: "${message}"

# Task
Provide a clear, concise, and helpful response.
Keep it professional and friendly.`;

    console.log('getting default response...');
    return await this.openAIService.getCompletion(prompt);
  }
}
