import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from '../openai/openai.service';
import { ResearchAgentService } from '../research-agent/research-agent.service';
import { ContentGeneratorService } from '../content-generator/content-generator.service';
import { EmailService } from '../email/email.service';
import { DocsService } from '../documents/document.service';
import {
  AgentResponse,
  IdeaGenerationRequest,
  IdeaGenerationResponse,
} from './manager-agent.types';

@Injectable()
export class ManagerAgentService {
  private readonly logger = new Logger(ManagerAgentService.name);

  constructor(
    private readonly openAIService: OpenAIService,
    private readonly researchAgentService: ResearchAgentService,
    private readonly contentGeneratorService: ContentGeneratorService,
    private readonly emailService: EmailService,
    private readonly docsService: DocsService,
  ) {}

  private async getDefaultResponse(message: string): Promise<string> {
    const prompt = `
# About you:
* You are a professional AI assistant
* You aim to provide clear, helpful responses
* You keep explanations concise and focused

# Context:
User message: "${message}"

# Requirements:
* Provide a professional and helpful response
* If you cannot help, explain why briefly and suggest alternatives
* Keep the response concise and clear

Respond directly without including the above prompt structure.`;

    try {
      const response = await this.openAIService.getCompletion(prompt);
      return response.trim();
    } catch (error) {
      this.logger.error(`Error getting default response: ${error}`);
      return "I apologize, but I'm having trouble processing your request. Could you please rephrase or try again?";
    }
  }

  async processInput(message: string): Promise<string> {
    try {
      // Analyze user input to determine intent and required agents
      const analysis = await this.analyzeUserInput(message);

      // Handle different types of requests
      switch (analysis.primaryIntent) {
        case 'content_creation':
          return await this.handleContentCreation(message, analysis);
        case 'email':
          return await this.handleEmailTasks(message, analysis);
        case 'document':
          return await this.handleDocumentTasks(message, analysis);
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
      Analyze this user input and determine:
      1. Primary intent (content_creation, email, document)
      2. Required sub-tasks
      3. Required agents
      4. Key parameters

      User Input: "${input}"

      Respond with only the JSON object, no markdown formatting.
    `;

    const response = await this.openAIService.getCompletion(prompt);
    // Clean the response by removing markdown code block syntax if present
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedResponse);
  }

  private async handleContentCreation(
    message: string,
    analysis: any,
  ): Promise<string> {
    // First, generate content ideas
    const ideaRequest: IdeaGenerationRequest = {
      topic: analysis.parameters.topic,
      targetAudience: analysis.parameters.targetAudience,
      contentType: analysis.parameters.contentType,
      additionalContext: analysis.parameters.context,
    };

    const ideas = await this.generateContentIdeas(ideaRequest);

    // Present ideas to user and wait for selection
    // Note: In a real implementation, you'd need to handle this interaction asynchronously
    const selectedIdea = ideas.ideas[0]; // For demonstration, using first idea

    // Generate content based on selected idea
    const content = await this.contentGeneratorService.generateContent({
      topic: selectedIdea.title,
      contentType: analysis.parameters.contentType,
      tone: analysis.parameters.tone,
      targetAudience: selectedIdea.targetAudience,
      additionalContext: selectedIdea.description,
    });

    // Evaluate the generated content
    const evaluation = await this.evaluateContent(content);

    if (evaluation.success) {
      return `Here's your content:\n\n${content.text}${
        content.imageUrl ? `\n\nImage: ${content.imageUrl}` : ''
      }`;
    } else {
      // If content needs improvement, regenerate with feedback
      return await this.regenerateContent(content, evaluation.feedback);
    }
  }

  private async generateContentIdeas(
    request: IdeaGenerationRequest,
  ): Promise<IdeaGenerationResponse> {
    const prompt = `
      Generate innovative content ideas for:
      Topic: ${request.topic}
      Target Audience: ${request.targetAudience || 'General'}
      Content Type: ${request.contentType || 'All types'}
      Additional Context: ${request.additionalContext || 'None'}

      For each idea, provide:
      1. Title
      2. Description
      3. Potential Impact
      4. Target Audience
      5. Estimated Engagement

      Format as JSON.
    `;

    const response = await this.openAIService.getCompletion(prompt);
    // Clean the response by removing markdown code block syntax if present
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedResponse);
  }

  private async evaluateContent(content: any): Promise<AgentResponse> {
    const evaluationPrompt = `
      Evaluate this content for:
      1. Quality and engagement
      2. Accuracy and relevance
      3. Target audience alignment
      4. Grammar and clarity
      5. Overall impact

      Content: ${JSON.stringify(content)}

      Provide a detailed evaluation and whether it meets quality standards.
      Include specific feedback if improvements are needed.
      Format as JSON with 'success' and 'feedback' fields.
    `;

    const response = await this.openAIService.getCompletion(evaluationPrompt);
    // Clean the response by removing markdown code block syntax if present
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedResponse);
  }

  private async regenerateContent(
    content: any,
    feedback: string,
  ): Promise<string> {
    console.log('Regenerating content based on feedback:', content, feedback);
    // Implementation for regenerating content based on feedback
    // This would involve calling the content generator again with refined parameters
    return 'Content regeneration based on feedback';
  }

  // Additional methods for handling email and document tasks would go here
  private async handleEmailTasks(
    message: string,
    analysis: any,
  ): Promise<string> {
    console.log('Handling email tasks:', message, analysis);
    // Implementation for email-related tasks
    return 'Email task handling';
  }

  private async handleDocumentTasks(
    message: string,
    analysis: any,
  ): Promise<string> {
    console.log('Handling document tasks:', message, analysis);
    // Implementation for document-related tasks
    return 'Document task handling';
  }
}
