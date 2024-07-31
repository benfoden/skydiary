import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import React from "react";
import { Card } from "~/app/_components/Card";
import FormButton from "~/app/_components/FormButton";
import Input from "~/app/_components/Input";
import { env } from "~/env";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { getNewImageUrl } from "~/utils/_uploads";

const NewUserPage: React.FC = async () => {
  const t = await getTranslations();
  const session = await getServerAuthSession();

  if (!session) return redirect("/auth/signin");
  if (
    session.user.name &&
    session.user.isWorkFocused !== undefined &&
    session.user.isWorkFocused !== null
  ) {
    return redirect("/home");
  }

  return (
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
            const isWorkFocused = formData.get("mainFocused") === "work";

            const imageFile = (formData.get("imageFile") as File) ?? undefined;
            const image = await getNewImageUrl({ imageFile });
            const isUser = true;

            if (name) {
              try {
                await api.user.updateUser({
                  name,
                  isWorkFocused,
                  stripeProductId: env.PRODUCT_ID_LITE,
                });
                await api.persona.create({
                  name,
                  age: age ?? 0,
                  gender: gender ?? "",
                  traits: "",
                  image,
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
            label={t("new-user.yourName")}
            required
          />
          <Input
            type="radio"
            required
            radioOptions={[
              {
                id: "personal",
                label: t("new-user.personal"),
                value: "personal",
                checked: true,
              },
              { id: "work", label: t("new-user.work"), value: "work" },
            ]}
            name="mainFocus"
            label={t("new-user.mainFocus")}
          />
          <Input
            type="number"
            id="age"
            name="age"
            label={t("new-user.your age")}
            min={13}
          />

          <Input
            type="text"
            id="gender"
            name="gender"
            label={t("new-user.your identities")}
            placeholder={t("new-user.placeholder identities")}
          />
          <Input
            type="text"
            id="occupation"
            name="occupation"
            label={t("new-user.occupation")}
            placeholder={t("new-user.occupationPlaceholder")}
          />
          <Input
            type="file"
            id="imageFile"
            name="imageFile"
            label={t("new-user.profilePicture")}
            fileSelectButtonLabel={t("new-user.chooseImage")}
          />

          <FormButton isSpecial variant="submit">
            {t("auth.save and continue")}
          </FormButton>
        </form>
      </Card>
    </div>
  );
};

export default NewUserPage;
