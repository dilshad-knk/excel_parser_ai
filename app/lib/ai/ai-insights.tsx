
'use server';

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateInsightFromData(prompt: string, allData: {
  clients?: any[];
  workers?: any[];
  tasks?: any[];
}): Promise<string> {
  const combinedContext = [];
  if (allData?.clients?.length) {
    combinedContext.push(`Clients:\n${JSON.stringify(allData.clients)}`);
  }
  if (allData?.workers?.length) {
    combinedContext.push(`Workers:\n${JSON.stringify(allData.workers)}`);
  }
  if (allData?.tasks?.length) {
    combinedContext.push(`Tasks:\n${JSON.stringify(allData.tasks)}`);
  }

  const sample = combinedContext.join('\n\n') || 'No data uploaded';

  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `
You are a data assistant. The user uploaded the following data:

${sample}

The user asks:
"${prompt}"

If the question is clearly related to any of this data (column names, values, or patterns), give a helpful answer.
If not, respond strictly with:
"This question is not related to the uploaded data."

Answer:`
  });

  return (result.text ?? '').trim();
}
