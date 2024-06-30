import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import Button from "~/app/_components/Button";
import { Card } from "~/app/_components/Card";
import DropDownUser from "~/app/_components/DropDownUser";
import FormButton from "~/app/_components/FormButton";
import Input from "~/app/_components/Input";
import { NavChevronLeft } from "~/app/_components/NavChevronLeft";
import { SessionNav } from "~/app/_components/SessionNav";
import { setUserLocale } from "~/i18n";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Settings() {
  const session = await getServerAuthSession();

  const userPersona = await api.persona.getUserPersona();
  const t = await getTranslations();

  return (
    <>
      <SessionNav>
        <div className="flex items-center gap-2">
          <NavChevronLeft targetPathname={"/home"} label={t("nav.home")} />
        </div>
        <h1>{t("nav.settings")}</h1>
        <DropDownUser />
      </SessionNav>

      <main className="flex min-h-screen w-full flex-col items-center justify-start">
        <div className="container flex flex-col items-center justify-start gap-12 sm:w-96">
          {session?.user.email === "ben.foden@gmail.com" && (
            <Link href={"/sd-admin"}>
              <Button>webmaster zone</Button>
            </Link>
          )}
          <Card variant="form">
            <h2>{t("settings.personal")}</h2>
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
                    await api.user.updateUser({ name });
                    if (!userPersona) {
                      await api.persona.create({
                        name,
                        age,
                        gender,
                        traits: "",
                        isUser,
                      });
                    } else {
                      await api.persona.update({
                        personaId: userPersona?.id,
                        name,
                        age,
                        gender,
                        traits: "",
                        isUser,
                      });
                    }
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
                label={t("settings.your name")}
                defaultValue={session?.user.name ?? ""}
              />
              <Input
                type="number"
                id="age"
                name="age"
                required
                placeholder="1"
                defaultValue={userPersona?.age ?? 0}
                label={t("settings.your age")}
              />

              <Input
                id="gender"
                name="gender"
                required
                placeholder={t("settings.placeholder identities")}
                defaultValue={userPersona?.gender ?? ""}
                label={t("settings.your identities")}
              />

              <FormButton variant="submit">{t("form.save")}</FormButton>
            </form>
          </Card>

          <Card variant="form">
            <h2>{t("settings.language")}</h2>
            <form
              action={async (formData) => {
                "use server";
                const locale: string = formData.get("data-locale") as string;
                await setUserLocale(locale);
                redirect("/settings");
              }}
              className="flex flex-row gap-2"
            >
              <FormButton variant="menuElement" data-locale="en">
                {t("settings.en")}
              </FormButton>
              <FormButton variant="menuElement" data-locale="ja">
                {t("settings.ja")}
              </FormButton>
            </form>
          </Card>
        </div>
      </main>
    </>
  );
}
