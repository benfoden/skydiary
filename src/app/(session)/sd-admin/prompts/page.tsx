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

  const content =
    "I have returned to the webmaster zone to continue my work on the app after a time away. I am tired, but determined.";

  const comment = prompts.comment({
    authorDetails: currentUserPersona!,
    content,
    personaDetails: persona!,
  });

  const tags = prompts.tag({
    content,
  });

  const userPersonaPrompt = prompts.userPersona({
    persona: currentUserPersona!,
    content,
    wordLimit: 10,
  });

  const chat = prompts.chatStart({
    authorDetails: currentUserPersona!,
    personaDetails: persona!,
  });

  const summary = prompts.summary({
    content,
  });

  return (
    <>
      <div className="flex w-full flex-col items-center gap-4">
        <h2>Prompts</h2>
        <Card isButton={false}>
          <div className="flex w-full flex-row justify-between gap-4">
            <h3>Comment</h3>
            Length: {comment.length - content.length}
          </div>
          {comment}
        </Card>

        <Card isButton={false}>
          <div className="flex w-full flex-row justify-between gap-4">
            <h3>Tags</h3>
            Length: {tags.length - content.length}
          </div>
          {tags}
        </Card>

        <Card isButton={false}>
          <div className="flex w-full flex-row justify-between gap-4">
            <h3>User Persona</h3>
            Length: {userPersonaPrompt.length - content.length}
          </div>
          {userPersonaPrompt}
        </Card>
        <Card isButton={false}>
          <div className="flex w-full flex-row justify-between gap-4">
            <h3>Summary</h3>
            Length: {summary.length - content.length}
          </div>
          {summary}
        </Card>
        <Card isButton={false}>
          <div className="flex w-full flex-row justify-between gap-4">
            <h3>Chat</h3>
            Length: {chat.length - content.length}
          </div>
          {chat}
        </Card>
      </div>
    </>
  );
}
