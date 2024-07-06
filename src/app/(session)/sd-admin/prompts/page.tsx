/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Card } from "~/app/_components/Card";
import { api } from "~/trpc/server";
import { commentPromptString, randomizedCoachVariant } from "~/utils/prompts";

export default async function Secret() {
  const currentUserPersona = await api.persona.getUserPersona();
  const buildPrompt = () => {
    const commentType = randomizedCoachVariant;
    const diaryEntry = "I'm working on the app today, fine-tuning the prompts.";

    return commentPromptString({
      commentType,
      authorDetails: currentUserPersona!,
      diaryEntry,
    });
  };
  return (
    <>
      <div className="flex w-full flex-col items-center gap-4">
        <h2>Prompts</h2>
        <Card isButton={false}>
          <div className="flex w-full flex-col items-start gap-4">
            {buildPrompt()}
          </div>
        </Card>
      </div>
    </>
  );
}
