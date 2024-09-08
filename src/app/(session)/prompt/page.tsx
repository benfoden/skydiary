import FormButton from "~/app/_components/FormButton";
import Input from "~/app/_components/Input";
import { api } from "~/trpc/server";

export default async function Prompts() {
  const prompts = await api.userPrompt.getByUserId();
  return (
    <div>
      Prompts
      <div>
        <form
          action={async (formData) => {
            "use server";

            const content = formData.get("content") as string;
            if (!content) {
              return;
            }
            await api.userPrompt.create({
              content,
            });
          }}
          method="post"
        >
          <Input label="Write a new prompt" name="content" />
          <FormButton>Submit</FormButton>
        </form>
      </div>
      <div>
        {prompts?.map((prompt) => <div key={prompt.id}>{prompt.content}</div>)}
      </div>
    </div>
  );
}
