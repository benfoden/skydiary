import OpenAI from "openai";
import { env } from "~/env";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function getResponse({
  messageContent,
  systemMessageContent = "",
  model = "gpt-4o-mini",
}: {
  messageContent: string;
  systemMessageContent?: string;
  model?: string;
}) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemMessageContent },
        { role: "user", content: messageContent },
      ],
      model,
    });

    return completion.choices[0]?.message.content;
  } catch (error) {
    console.error("Error getting response from LLM:", error);
    throw new Error("Error getting response from chat");
  }
}

export async function getResponseJSON({
  messageContent,
  model = "gpt-4o-mini",
}: {
  messageContent: string;
  model?: string;
}) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: messageContent }],
      model,
      response_format: { type: "json_object" },
    });

    return completion.choices[0]?.message.content;
  } catch (error) {
    console.error("Error getting response from LLM:", error);
    throw new Error("Error getting response from chat");
  }
}

export async function getResponseFromChatMessages({
  messages,
  userPersonaId,
  aiPersonaId,
  model = "gpt-4o-mini",
}: {
  messages: { personaId: string | undefined | null; content: string }[];
  userPersonaId: string;
  aiPersonaId: string;
  model?: string;
}) {
  try {
    const completion = await openai.chat.completions.create({
      messages: messages.map((message) => ({
        role: message.personaId === userPersonaId ? "user" : "assistant",
        content: message.content,
      })),
      model,
    });

    return {
      personaId: aiPersonaId,
      content:
        completion.choices[0]?.message.content ??
        `error: ${JSON.stringify(completion)}`,
    };
  } catch (error) {
    console.error("Error getting response from LLM:", error);
    throw new Error("Error getting response from chat");
  }
}
