import OpenAI from "openai";
import { env } from "~/env";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function getResponse(inputText: string) {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: inputText }],
    model: "gpt-4-0125-preview",
  });

  return completion.choices[0]?.message.content;
}

export async function getResponseFromArr(inputTexts: string[]) {
  const completion = await openai.chat.completions.create({
    messages: inputTexts.map((text) => ({ role: "user", content: text })),
    model: "gpt-4-0125-preview",
  });

  return completion.choices[0]?.message.content;
}
