/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Card } from "~/app/_components/Card";
import { getResponse } from "~/server/api/ai";
import { api } from "~/trpc/server";
import { commentPromptString } from "~/utils/prompts";

export default async function Secret() {
  const currentUserPersona = await api.persona.getUserPersona();

  const persona = await api.persona.getById({
    personaId: "clxyqqo3l00005ep3t8amw32a",
  }); // minami

  const prompt = commentPromptString({
    authorDetails: currentUserPersona!,
    diaryEntry:
      "I have returned to the webmaster zone to continue my work on the app after a time away. I am tired, but determined.",
    personaDetails: persona!,
  });

  let greeting = "";
  if (persona && currentUserPersona) {
    greeting =
      (await getResponse({
        messageContent: prompt,
        isSubscriber: true,
      })) ?? "Welcome back";
  }

  return (
    <>
      <div className="flex w-full flex-col items-center gap-4">
        <h2>Prompts</h2>
        <Card isButton={false}>
          <div className="mb-8 flex w-full flex-col items-start gap-4">
            {prompt}
            <div>
              Length:
              {prompt.length}
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-4">
            {greeting}
            <div>
              Length:
              {greeting.length}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
