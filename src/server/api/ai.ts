import OpenAI from "openai";
import { env } from "~/env";
import { type OPENAIMODELS } from "~/utils/constants";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function getResponse(
  inputText: string,
  model: OPENAIMODELS[number] = "gpt-3.5-turbo",
  systemMessage = "",
) {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: inputText },
    ],
    max_tokens: 1000,
    model,
  });

  console.log("the usage!", completion.usage);
  return completion.choices[0]?.message.content;
}

export async function getResponseJSON(inputText: string) {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: inputText }],
    model: "gpt-4o",
    response_format: { type: "json_object" },
  });

  return completion.choices[0]?.message.content;
}

export async function getResponseFromArr(inputTexts: string[]) {
  const completion = await openai.chat.completions.create({
    messages: inputTexts.map((text) => ({ role: "user", content: text })),
    model: "gpt-4o",
  });

  return completion.choices[0]?.message.content;
}
