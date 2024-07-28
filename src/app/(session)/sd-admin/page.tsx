"use server";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { prompts } from "~/utils/prompts";
import ChatThread from "./ChatThread";

export default async function Secret() {
  const session = await getServerAuthSession();
  const userPersona = await api.persona.getUserPersona();
  const aiPersona = await api.persona.getById({
    personaId: "clxyqqo3l00005ep3t8amw32a",
  });

  if (!userPersona?.id || !aiPersona?.id) return null;

  const firstMessage = prompts.chatStart({
    authorDetails: userPersona,
    personaDetails: aiPersona,
    commentType: "custom",
    characters: 280,
  });

  return (
    <>
      <ChatThread
        user={session?.user}
        firstMessage={firstMessage}
        currentUserPersona={userPersona}
      />
    </>
  );
}
