/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Card } from "~/app/_components/Card";
import { getResponse } from "~/server/api/ai";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { productPlan } from "~/utils/constants";
import { commentPromptString } from "~/utils/prompts";

export default async function Secret() {
  const currentUserPersona = await api.persona.getUserPersona();
  const session = await getServerAuthSession();
  const { user } = session;
  if (!user) return null;

  const persona = await api.persona.getById({
    personaId: "clxy6sprp000014e4dths21fv",
  });

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
        model: user?.isSpecial
          ? "gpt-4o"
          : productPlan(user?.stripeProductId)?.model,
      })) ?? "Welcome back";
  }

  return (
    <>
      <div className="flex w-full flex-col items-center gap-4">
        <h2>Prompts</h2>
        <Card isButton={false}>
          <div className="mb-8 flex w-full flex-col items-start gap-4">
            <div>
              Entry: I have returned to the webmaster zone to continue my work
              on the app after a time away. I am tired, but determined.
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-4">
            {persona?.name}: {greeting}
            <div>
              Length:
              {greeting.length}
            </div>
          </div>
          {prompt}
          <div>
            Length:
            {prompt.length}
          </div>
        </Card>
      </div>
    </>
  );
}
