import { api } from "~/trpc/server";

export default function UserPrompt() {
  const prompts = await api.prompt.getByuserId();

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-3xl font-bold">Welcome to Skydiary</h1>
      <p className="text-lg">
        Please sign in to continue. If you don't have an account, you can create
        one.
      </p>
    </div>
  );
}
