import axios from "axios";

export default {
  generateCompletionForConversation(prompt, commentToTest) {
    return axios.post(
      "/api/openai/generate_chat_completion",
      {
        prompt,
        commentToTest,
      },
      {
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 120000,
      }
    );
  },
  generateMarketingTexts(template, input_variables) {
    return axios.post(
      "/api/openai/generate_marketing_texts",
      {
        template,
        input_variables,
      },
      {
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 120000,
      }
    );
  },
};
