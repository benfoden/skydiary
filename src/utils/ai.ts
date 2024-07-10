import OpenAI from "openai";
import { env } from "~/env";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function getResponse({
  messageContent,
  systemMessageContent = "",
  model = "gpt-3.5-turbo",
}: {
  messageContent: string;
  systemMessageContent?: string;
  model?: string;
}) {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemMessageContent },
      { role: "user", content: messageContent },
    ],
    model,
  });

  return completion.choices[0]?.message.content;
}

export async function getResponseJSON({
  messageContent,
  model = "gpt-3.5-turbo",
}: {
  messageContent: string;
  model?: string;
}) {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: messageContent }],
    model,
    response_format: { type: "json_object" },
  });

  return completion.choices[0]?.message.content;
}

export async function getResponseFromArr(
  inputTexts: string[],
  model = "gpt-3.5-turbo",
) {
  const completion = await openai.chat.completions.create({
    messages: inputTexts.map((text) => ({ role: "user", content: text })),
    model,
  });

  return completion.choices[0]?.message.content;
}
