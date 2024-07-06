import { Card } from "~/app/_components/Card";
import { getResponse } from "~/server/api/ai";
import { api } from "~/trpc/server";
import { commentPromptString } from "~/utils/prompts";

export default async function Secret() {
  const currentUserPersona = await api.persona.getUserPersona();
  const persona = await api.persona.getById({
    personaId: "clxyqqo3l00005ep3t8amw32a",
  });
  let greeting = "Welcome back";
  if (persona && currentUserPersona) {
    greeting =
      (await getResponse({
        messageContent: commentPromptString({
          authorDetails: currentUserPersona,
          diaryEntry:
            "I am Ben, Minami's master. I have returned to continue my work on the app after a long time away. I want to be welcomed back and hear something from Minami how she is ready to please me. _prompt: Make this message no more than two sentences. Do not use Ben's name.",
          personaDetails: persona,
        }),
      })) ?? "Welcome back";
  }
  return (
    <>
      <main className="flex min-h-screen w-full flex-col items-center justify-start">
        <div className="container flex flex-col items-start justify-start gap-12 px-8 py-16 ">
          <details>
            <summary>Welcome back</summary>
            <div className="w-80">
              <Card>{greeting}</Card>
            </div>
          </details>
        </div>
      </main>
    </>
  );
}
