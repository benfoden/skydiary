import { PlusIcon } from "@radix-ui/react-icons";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Card } from "~/app/_components/Card";
import DropDownUser from "~/app/_components/DropDownUser";
import FormButton from "~/app/_components/FormButton";
import FormDeleteButton from "~/app/_components/FormDeleteButton";
import Input from "~/app/_components/Input";
import { NavChevronLeft } from "~/app/_components/NavChevronLeft";
import { SessionNav } from "~/app/_components/SessionNav";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Prompts() {
  const session = await getServerAuthSession();
  const { user } = session;
  const userGenPrompts = await api.userPrompt.getByUserId();
  const globalPrompts = await api.userPrompt.getAllGlobal();

  const t = await getTranslations();
  return (
    <>
      <SessionNav>
        <div className="flex items-center gap-2">
          <NavChevronLeft targetPathname={"/home"} label={t("nav.home")} />
        </div>
        <h1>{t("nav.prompts")}</h1>
        <DropDownUser />
      </SessionNav>

      <main className="flex min-h-screen w-full flex-col items-center justify-start">
        <div className="container flex w-full flex-col items-center justify-start gap-8 px-2 pb-12 md:max-w-3xl">
          <form
            action={async (formData) => {
              "use server";
              const content = formData.get("content") as string;

              if (!content) {
                return;
              }

              try {
                await api.userPrompt.create({
                  content,
                  createdById: user?.id,
                });
                redirect("/prompt");
              } catch (error) {
                throw new Error("Error creating prompt");
              }
            }}
            method="post"
          >
            <Input label="Write a new prompt" name="content" />
            <FormButton variant="submit" isSpecial>
              Save
            </FormButton>
          </form>
          {user?.isAdmin && (
            <form
              action={async (formData) => {
                "use server";
                const content = formData.get("content") as string;

                if (!content) {
                  return;
                }

                try {
                  await api.userPrompt.create({
                    content,
                    isGlobal: true,
                  });

                  redirect("/prompt");
                } catch (error) {
                  throw new Error("Error creating prompt");
                }
              }}
              method="post"
            >
              <Input label="Webmaster: Write a new prompt" name="content" />
              <FormButton variant="submit" isSpecial>
                Save
              </FormButton>
            </form>
          )}
          {userGenPrompts?.length > 0 && (
            <div className="flex flex-col gap-4">
              all your prompts
              {userGenPrompts?.map((prompt) => (
                <Card key={prompt.id} isButton={false}>
                  <div className="flex w-full flex-row items-center justify-between gap-2">
                    <p>{prompt.content}</p>
                    <form
                      action={async () => {
                        "use server";
                        try {
                          await api.userPrompt.delete({
                            id: prompt.id,
                          });
                          redirect(`/prompt`);
                        } catch (error) {
                          throw new Error("Error deleting prompt");
                        }
                      }}
                    >
                      <FormDeleteButton hasText={false} />
                    </form>
                  </div>
                </Card>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-4">
            all skydiary prompts
            {globalPrompts?.map((prompt) => (
              <Card isButton={false} key={prompt.id}>
                <div className="flex w-full flex-row items-center justify-between gap-2">
                  <p>{prompt.content}</p>

                  <form
                    action={async () => {
                      "use server";

                      try {
                        await api.userPrompt.create({
                          content: prompt.content,
                          createdById: user?.id,
                          isGlobal: false,
                        });
                        redirect("/prompt");
                      } catch (error) {
                        throw new Error("Error creating prompt");
                      }
                    }}
                  >
                    <FormButton>
                      <PlusIcon className="h-6 w-6" />
                    </FormButton>
                  </form>
                </div>
                {user?.isAdmin && (
                  <form
                    action={async () => {
                      "use server";

                      try {
                        await api.userPrompt.delete({
                          id: prompt.id,
                        });
                        redirect("/prompt");
                      } catch (error) {
                        throw new Error("Error deleting prompt");
                      }
                    }}
                  >
                    <FormDeleteButton hasText={false} />
                  </form>
                )}
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
