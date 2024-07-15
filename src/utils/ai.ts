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

export async function getResponseFromChatMessages({
  messages,
  userPersonaId,
  aiPersonaId,
  model = "gpt-3.5-turbo",
}: {
  messages: { personaId: string | undefined | null; content: string }[];
  userPersonaId: string;
  aiPersonaId: string;
  model?: string;
}) {
  const completion = await openai.chat.completions.create({
    messages: messages.map((message) => ({
      role:
        message.personaId === "system"
          ? "system"
          : message.personaId === userPersonaId
            ? "user"
            : "assistant",
      content: message.content,
    })),
    model,
  });

  return {
    personaId: aiPersonaId,
    content: completion.choices[0]?.message.content ?? "error",
  };
}
