import OpenAI from "openai";
import { env } from "~/env";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function getResponse({
  messageContent,
  systemMessageContent = "",
  isSubscriber = false,
}: {
  messageContent: string;
  systemMessageContent?: string;
  isSubscriber?: boolean;
}) {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemMessageContent },
      { role: "user", content: messageContent },
    ],
    max_tokens: 1000,
    model: isSubscriber ? "gpt-4o" : "gpt-3.5-turbo",
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
