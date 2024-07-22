/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Card } from "~/app/_components/Card";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { prompts } from "~/utils/prompts";

export default async function Secret() {
  const currentUserPersona = await api.persona.getUserPersona();
  const session = await getServerAuthSession();
  const { user } = session;
  if (!user) return null;

  const persona = await api.persona.getById({
    personaId: "clxy6sprp000014e4dths21fv",
  });

  const comment = prompts.comment({
    authorDetails: currentUserPersona!,
    content:
      "I have returned to the webmaster zone to continue my work on the app after a time away. I am tired, but determined.",
    personaDetails: persona!,
  });

  const summary = prompts.summary({
    content:
      "I have returned to the webmaster zone to continue my work on the app after a time away. I am tired, but determined.",
  });

  const tags = prompts.tag({
    content:
      "I have returned to the webmaster zone to continue my work on the app after a time away. I am tired, but determined.",
  });

  const chat = prompts.chatStart({
    authorDetails: currentUserPersona!,
    personaDetails: persona!,
  });

  const userPersonaPrompt = prompts.userPersona({
    persona: currentUserPersona!,
    content:
      "I have returned to the webmaster zone to continue my work on the app after a time away. I am tired, but determined.",
    wordLimit: 10,
  });

  return (
    <>
      <div className="flex w-full flex-col items-center gap-4">
        <h2>Prompts</h2>
        <Card isButton={false}>
          <div className="flex flex-row gap-4">
            <h3>Comment</h3>
            Length:
            {comment.length}
          </div>
          {comment}
        </Card>

        <Card isButton={false}>
          <div className="flex flex-row gap-4">
            <h3>Tags</h3>
            Length:
            {tags.length}
          </div>
          {tags}
        </Card>

        <Card isButton={false}>
          <div className="flex flex-row gap-4">
            <h3>User Persona</h3>
            Length:
            {userPersonaPrompt.length}
          </div>
          {userPersonaPrompt}
        </Card>
        <Card isButton={false}>
          <div className="flex flex-row gap-4">
            <h3>Summary</h3>
            Length:
            {summary.length}
          </div>
          {summary}
        </Card>
        <Card isButton={false}>
          <div className="flex flex-row gap-4">
            <h3>Chat</h3>
            Length:
            {chat.length}
          </div>
          {chat}
        </Card>
      </div>
    </>
  );
}
