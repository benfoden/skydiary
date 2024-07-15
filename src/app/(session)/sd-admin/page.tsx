"use server";
import { api } from "~/trpc/server";
import { prompts } from "~/utils/prompts";
import ChatThread from "./ChatThread";

export default async function Secret() {
  const userPersona = await api.persona.getUserPersona();
  const aiPersona = await api.persona.getById({
    personaId: "clxy6sprp000014e4dths21fv",
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
      <main className="flex min-h-screen w-full flex-col items-center justify-start">
        <div className="container flex flex-col items-start justify-start gap-12 px-8 py-16 ">
          <ChatThread
            firstMessage={firstMessage}
            currentUserPersona={userPersona}
          />
        </div>
      </main>
    </>
  );
}
