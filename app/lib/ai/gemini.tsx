
'use server';

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateRuleFromPrompt(userPrompt: string): Promise<any> {
  const instructions = `
You are a JSON rule generator. Convert the user's natural language into a valid JSON rule based on one of these formats:

Co-run:
{ "type": "coRun", "tasks": ["T1", "T2"] }

Slot restriction:
{ "type": "slotRestriction", "group": "Sales", "minCommonSlots": 2 }

Load limit:
{ "type": "loadLimit", "group": "Engineering", "maxSlotsPerPhase": 3 }

Phase window:
{ "type": "phaseWindow", "task": "T5", "allowedPhases": [1, 2, 3] }

Rules:
- Always return valid JSON
- Never include explanations or markdown
- Use camelCase keys
- Only return one rule at a time

User Input: "${userPrompt}"
`;

  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: instructions,
  });

  const raw = result.text?.trim();

  console.log(raw)

  try {
    if (typeof raw !== 'string') {
      throw new Error('Gemini did not return any text.');
    }
    return JSON.parse(raw);
  } catch {
    throw new Error('Gemini returned invalid JSON:\n' + raw);
  }
}

