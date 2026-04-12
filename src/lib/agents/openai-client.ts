import OpenAI from 'openai'
import { AzureOpenAI } from 'openai'

/**
 * Create an AI client. Supports:
 * 1. New setup: AI_BASE_URL + AI_MODEL (standard OpenAI SDK — for Kimi, Grok, etc. on Azure AI Foundry)
 * 2. Legacy setup: AZURE_OPENAI_ENDPOINT + AZURE_OPENAI_DEPLOYMENT (AzureOpenAI SDK)
 */
export function createOpenAIClient(apiKey?: string): OpenAI {
  const key = apiKey || process.env.AZURE_OPENAI_KEY

  // New setup: standard OpenAI client with custom base_url (Azure AI Foundry models)
  if (process.env.AI_BASE_URL) {
    return new OpenAI({
      baseURL: process.env.AI_BASE_URL,
      apiKey: key,
    })
  }

  // Legacy: AzureOpenAI client
  return new AzureOpenAI({
    apiKey: key,
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiVersion: '2024-12-01-preview',
  })
}

export const GPT_MODEL = process.env.AI_MODEL || process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-5.4-mini'
