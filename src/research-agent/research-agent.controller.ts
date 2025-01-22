import { Controller } from '@nestjs/common';
import { ResearchAgentService } from './research-agent.service';

@Controller('research-agent')
export class ResearchAgentController {
  constructor(private readonly researchAgentService: ResearchAgentService) {}
}
