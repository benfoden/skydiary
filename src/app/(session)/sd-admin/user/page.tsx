import { getTranslations } from "next-intl/server";
import { Card } from "~/app/_components/Card";
import FormButton from "~/app/_components/FormButton";
import Input from "~/app/_components/Input";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Secret() {
  const session = await getServerAuthSession();
  const userPersona = await api.persona.getUserPersona();
  const t = await getTranslations();

  return (
    <>
      <Card variant="form">
        <div className="flex w-full flex-col items-center gap-4 sm:w-[512px]">
          <h2>{userPersona?.name}</h2>
          <form
            className="flex w-full flex-col gap-4"
            action={async (formData) => {
              "use server";
              const name: string = formData.get("name") as string;
              const age = Number(formData.get("age"));
              const gender: string = formData.get("gender") as string;
              const traits: string = formData.get("traits") as string;
              const description: string = formData.get("description") as string;
              const relationship: string = formData.get(
                "relationship",
              ) as string;
              const occupation: string = formData.get("occupation") as string;
              const communicationStyle: string = formData.get(
                "communicationStyle",
              ) as string;
              const communicationSample: string = formData.get(
                "communicationSample",
              ) as string;
              const isUser = true;

              if (name && userPersona) {
                try {
                  await api.user.updateUser({ name });
                  await api.persona.update({
                    personaId: userPersona?.id,
                    name,
                    age,
                    gender,
                    traits,
                    description,
                    relationship,
                    occupation,
                    communicationStyle,
                    communicationSample,
                    isUser,
                  });
                } catch (error) {
                  console.error("Error updating user:", error);
                }
              }
            }}
          >
            <Input
              id="name"
              name="name"
              placeholder={t("settings.placeholderName")}
              required
              label={t("personas.name")}
              defaultValue={session?.user.name ?? ""}
            />
            <Input
              type="number"
              id="age"
              name="age"
              required
              placeholder="1"
              defaultValue={userPersona?.age ?? 0}
              label={t("personas.age")}
            />
            <Input
              id="gender"
              name="gender"
              required
              placeholder={t("settings.placeholder identities")}
              defaultValue={userPersona?.gender ?? ""}
              label={t("personas.identities")}
            />
            <Input
              type="textarea"
              id="traits"
              name="traits"
              label={t("personas.traits")}
              defaultValue={userPersona?.traits ?? ""}
            />
            <Input
              type="textarea"
              id="description"
              name="description"
              label={t("personas.description")}
              defaultValue={userPersona?.description ?? ""}
            />
            <Input
              type="textarea"
              id="relationship"
              name="relationship"
              label={t("personas.relationship")}
              defaultValue={userPersona?.relationship ?? ""}
            />
            <Input
              id="occupation"
              name="occupation"
              label={t("personas.occupation")}
              defaultValue={userPersona?.occupation ?? ""}
            />
            <Input
              id="communicationStyle"
              name="communicationStyle"
              label={t("personas.communication style")}
              defaultValue={userPersona?.communicationStyle ?? ""}
            />
            <Input
              id="communicationSample"
              name="communicationSample"
              label={t("personas.communication sample")}
              defaultValue={userPersona?.communicationSample ?? ""}
            />
            <FormButton variant="submit">{t("form.save")}</FormButton>
          </form>
        </div>
        <form
          action={async () => {
            "use server";
            await api.user.updateUser({
              name: "ben",
            });
          }}
        >
          <FormButton variant="submit">Activate subscription</FormButton>
        </form>
        <div className="w-80">{JSON.stringify(session?.user, null, 2)}</div>
      </Card>
    </>
  );
}
