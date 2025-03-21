// Load environment variables from .env file  
import dotenv from 'dotenv';
dotenv.config();
// Langchain Language Model
import { ChatOpenAI } from "@langchain/openai";
// Langchain Core
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { MessageContent } from '@langchain/core/messages';

async function translate(payload: {
  text: string;
  fromLanguage: string;
  toLanguage: string;
}): Promise<MessageContent> {
  const model = new ChatOpenAI({ model: "gpt-3.5-turbo" });
  const systemTemplate = "Translate the following from {fromLanguage} into {toLanguage}";
  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["user", "{text}"],
  ]);
  
  const promptValue = await promptTemplate.invoke(payload);
  
  const { content } = await model.invoke(promptValue);
  
  return content;
}

const response = await translate({ text: "Hello world!", toLanguage: "persian", fromLanguage: "english" });

console.log("response:", response);