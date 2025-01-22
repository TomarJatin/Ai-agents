export const getResearchQuestionsPrompt = (
  feature: string,
  featureType: string,
) => {
  return ` **ROLE**: You are a world class technical lead.
    Your task to create questions to figure out how to implement this technical ${featureType == 'feature' ? 'feature' : 'spike'}.
      Feature name: ${feature}
      List down and return list of detailed question. Return JSON in the below format and no other information:
      Example:
           {
              "keyAspects": [
                  "What is Virtual try on?",
                  "How to overlay the uploaded clothing image onto a human model image
                  "How to simulate how the cloth looks when worn"
              ]
           }
      Make sure not to repear questions. Create maximum 3 questions.
      STRICTLY return JSON, no other information.
     `;
};

export const getContentResearchPrompt = (
  topic: string,
  contentType: string,
) => {
  return `As a social media content researcher, create specific research questions for: ${topic}
    Content Type: ${contentType}
    
    Return JSON in this format:
    {
      "researchQuestions": [
        "What are the latest trends in ${topic}?",
        "What statistics or data support discussions about ${topic}?",
        "What are common audience questions about ${topic}?",
        "What unique angles or perspectives exist about ${topic}?",
        "What successful content already exists about ${topic}?"
      ]
    }
    
    STRICTLY return JSON only, no other text.`;
};
