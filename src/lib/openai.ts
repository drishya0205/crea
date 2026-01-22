import OpenAI from 'openai';

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_build',
    dangerouslyAllowBrowser: true // Only using in API routes but good precaution for local dev if needed
});
