import { type Persona } from "@prisma/client";
import { type NextRequest } from "next/server";
import { getResponseFromChatMessages } from "~/utils/ai";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    messages: { personaId: string | undefined | null; content: string }[];
    userPersona: Persona;
    aiPersona: Persona;
  };

  const { userPersona, aiPersona, messages } = body;

  if (!userPersona?.id || !aiPersona?.id) return null;

  return Response.json({
    newMessage: await getResponseFromChatMessages({
      messages,
      userPersonaId: userPersona.id,
      aiPersonaId: aiPersona.id,
      model: "gpt-4o",
    }),
  });
}
