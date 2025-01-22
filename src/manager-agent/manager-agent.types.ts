export enum AgentType {
  RESEARCH = 'research',
  CONTENT = 'content',
  EMAIL = 'email',
  DOCS = 'docs',
  IDEA = 'idea',
}

export interface AgentResponse {
  success: boolean;
  data: any;
  feedback?: string;
}

export interface IdeaGenerationRequest {
  topic: string;
  targetAudience?: string;
  contentType?: string;
  additionalContext?: string;
}

export interface IdeaGenerationResponse {
  ideas: Array<{
    title: string;
    description: string;
    potentialImpact: string;
    targetAudience: string;
    estimatedEngagement: string;
  }>;
}
