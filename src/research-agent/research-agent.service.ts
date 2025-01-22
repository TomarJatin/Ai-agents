import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from '../openai/openai.service';
import { ResearchAnswerResponse } from './research-agent.types';
import { tavily } from '@tavily/core';
import { getContentResearchPrompt } from './prompts/research.prompt';

@Injectable()
export class ResearchAgentService {
  private readonly logger = new Logger(ResearchAgentService.name);
  private readonly tvly: any;

  constructor(private readonly openAIService: OpenAIService) {
    this.tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
  }

  async researchContent(topic: string, contentType: string) {
    try {
      this.logger.log(`Researching content for topic: ${topic}`);

      // Get research questions
      const researchQuestions = await this.getContentResearchQuestions(
        topic,
        contentType,
      );

      // Get search results
      const searchResults = await this.getSearchResult(researchQuestions);

      // Analyze and summarize findings
      const analysis = await this.analyzeResearchResults(topic, searchResults);

      return analysis;
    } catch (error) {
      this.logger.error(`Error in content research: ${error}`);
      throw error;
    }
  }

  private async getContentResearchQuestions(
    topic: string,
    contentType: string,
  ) {
    try {
      const prompt = getContentResearchPrompt(topic, contentType);
      const response = await this.openAIService.getCompletion(prompt);

      const jsonResponse = JSON.parse(response);
      return jsonResponse.researchQuestions;
    } catch (error) {
      this.logger.error(`Error getting research questions: ${error}`);
      return [];
    }
  }

  private async getSearchResult(researchQuestions: string[]) {
    try {
      if (!researchQuestions?.length) {
        this.logger.warn('No research questions provided');
        return new Map();
      }

      const researchAnswers: Map<string, ResearchAnswerResponse> = new Map();

      await Promise.all(
        researchQuestions.map(async (question) => {
          const result = await this.tvly.search(question, {
            maxResults: 5,
            searchDepth: 'advanced',
          });

          const answers: ResearchAnswerResponse = result.results.map(
            (r: any) => ({
              title: r.title,
              content: r.content,
              url: r.url,
            }),
          );

          researchAnswers.set(question, answers);
        }),
      );

      return researchAnswers;
    } catch (error) {
      this.logger.error(`Error in search: ${error}`);
      return new Map();
    }
  }

  private async analyzeResearchResults(
    topic: string,
    searchResults: Map<string, ResearchAnswerResponse>,
  ) {
    try {
      const researchData = Array.from(searchResults.entries()).map(
        ([question, answers]) => ({
          question,
          answers: answers.map((a) => ({
            title: a.title,
            summary: a.content.substring(0, 300), // Truncate for prompt length
            url: a.url,
          })),
        }),
      );

      const analysisPrompt = `Analyze this research data for social media content about "${topic}":
        ${JSON.stringify(researchData)}
        
        Provide a structured analysis with:
        1. Key trends and insights
        2. Unique angles for content
        3. Popular talking points
        4. Relevant statistics
        5. Content recommendations`;

      return await this.openAIService.getCompletion(analysisPrompt);
    } catch (error) {
      this.logger.error(`Error analyzing results: ${error}`);
      throw error;
    }
  }
}
