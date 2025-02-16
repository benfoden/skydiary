"use server";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { prompts } from "~/utils/prompts";
import { useMdkJwk } from "~/utils/useMdkJwk";
import PersonaSidebar from "../persona/Sidebar";
import ChatThread from "./ChatThread";

export default async function Secret({
  searchParams,
}: {
  searchParams: { persona?: string };
}) {
  const mdkJwk = await useMdkJwk();
  const session = await getServerAuthSession();
  const userPersona = await api.persona.getUserPersona({ mdkJwk });
  let aiPersona = await api.persona.getById({
    personaId: "clxyqqo3l00005ep3t8amw32a",
    mdkJwk,
  });
  const aiPersonas = await api.persona.getAllByUserId({ mdkJwk });

  if (!userPersona?.id || !aiPersona?.id) return null;

  const firstMessage = prompts.chatStart({
    authorDetails: userPersona,
    personaDetails: aiPersona,
    commentType: "chat",
  });

  const { persona } = searchParams;

  if (persona) {
    aiPersona = await api.persona.getById({
      personaId: persona,
      mdkJwk,
    });
  }

  return (
    <>
      <div>
        Personas
        <PersonaSidebar personas={aiPersonas} isChat={true} />
      </div>
      {aiPersona && (
        <ChatThread
          user={session?.user}
          firstMessage={firstMessage}
          currentUserPersona={userPersona}
          aiPersona={aiPersona}
        />
      )}
    </>
  );
}
