import { AzureOpenAI } from 'openai'

export function createOpenAIClient(apiKey?: string): AzureOpenAI {
  return new AzureOpenAI({
    apiKey: apiKey || process.env.AZURE_OPENAI_KEY,
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiVersion: '2024-12-01-preview',
  })
}

export const GPT_MODEL = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-5.4-mini'
