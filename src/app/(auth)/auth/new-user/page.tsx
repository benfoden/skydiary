import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import React from "react";
import { Card } from "~/app/_components/Card";
import FormButton from "~/app/_components/FormButton";
import Input from "~/app/_components/Input";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

const NewUserPage: React.FC = async () => {
  const t = await getTranslations();
  const session = await getServerAuthSession();

  if (!session) return redirect("/auth/signin");
  if (session.user.name) return redirect("/home");

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      <div className="z-20 flex h-dvh w-full items-center justify-center">
        <div className="flex w-full flex-col items-center justify-center sm:w-96">
          <h1 className="mb-8 text-xl font-light">{t("new-user.title")}</h1>
          <Card variant="form">
            <p className="text-sm opacity-60">{t("settings.description")}</p>
            <form
              className="flex flex-col gap-4"
              action={async (formData) => {
                "use server";
                const name: string = formData.get("name") as string;
                const age = Number(formData.get("age"));
                const gender: string = formData.get("gender") as string;
                const isUser = true;

                if (name) {
                  try {
                    // todo: add user locale to user profile
                    await api.user.updateUser({ name });
                    await api.persona.create({
                      name,
                      age: age ?? 0,
                      gender: gender ?? "",
                      traits: "",
                      isUser,
                    });
                  } catch (error) {
                    console.error("Error updating user:", error);
                  }
                  redirect("/home");
                }
              }}
            >
              <Input
                id="name"
                name="name"
                label={t("new-user.your name")}
                required
              />
              <Input
                type="number"
                id="age"
                name="age"
                label={t("new-user.your age")}
                placeholder="1"
                min={13}
              />

              <Input
                type="text"
                id="gender"
                name="gender"
                label={t("new-user.your identities")}
                placeholder={t("new-user.placeholder identities")}
              />
              <FormButton variant="submit">
                {t("auth.save and continue")}
              </FormButton>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewUserPage;
