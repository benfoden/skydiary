import { ArrowRightIcon } from "@radix-ui/react-icons";
import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "~/app/_components/Card";
import FormButton from "~/app/_components/FormButton";
import HeroStringSwapper from "~/app/_components/HeroStringSwapper";
import Input from "~/app/_components/Input";
import { type Locale } from "~/config";
import { getServerAuthSession } from "~/server/auth";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("top.title"),
    description: t("top.description"),
    icons: [{ rel: "icon", url: "/favicon.ico" }],
  };
}

export default async function Top() {
  const session = await getServerAuthSession();
  const t = await getTranslations();

  return (
    <>
      <div className="flex w-full flex-col items-center justify-center md:flex-row">
        <Card variant="transparent" isButton={false}>
          <div className="flex w-full flex-col items-start gap-8 px-4 md:px-0">
            <div className="font-regular text-4xl">
              <div>{t("top.heroLine1")}</div>
              <div>
                <HeroStringSwapper
                  strings={[
                    t("top.personaName1"),
                    t("top.personaName2"),
                    t("top.personaName3"),
                    t("top.personaName4"),
                    t("top.personaName5"),
                    t("top.personaName6"),
                  ]}
                />
              </div>
            </div>

            <p className="text-lg font-light">{t("top.heroDescription")}</p>
            <div className="flex flex-col gap-2">
              <p className="font-light">· {t("top.heroDetail1")}</p>
              <p className="font-light">· {t("top.heroDetail2")}</p>
              <p className="font-light">· {t("top.heroDetail3")}</p>
            </div>
          </div>
        </Card>

        <div className="flex w-full flex-col items-center justify-start">
          {session ? (
            <Link href="/home">
              <Card variant="hero">
                <div className="flex flex-row items-center gap-2">
                  {t("top.welcomeBack")}
                  {session.user?.name && (
                    <>
                      <span>{session.user.name}</span>
                    </>
                  )}
                </div>
              </Card>
            </Link>
          ) : (
            <>
              <Card variant="hero" isButton={false}>
                <p className="text-xl font-light">{t("top.ctaTitle")}</p>
                <form
                  action={async (formData) => {
                    "use server";
                    const email = formData.get("email");
                    if (email) {
                      cookies().set("signupEmail", String(email));
                      redirect("/auth/signin");
                    }
                  }}
                >
                  <Input
                    placeholder={t("top.emailPlaceholder")}
                    type="email"
                    name="email"
                    required
                  />
                  <FormButton variant="submit" isSpecial>
                    <div className="flex items-center gap-2">
                      {t("top.heroCTA")}
                      <ArrowRightIcon className="h-3 w-3 animate-ping" />
                    </div>
                  </FormButton>
                </form>
              </Card>
              <Card variant="transparent" isButton={false}>
                <div className="flex w-fit flex-col items-center gap-8">
                  <div className="flex flex-col gap-2 text-xs">
                    <p className="font-light">· {t("top.privacyDetail1")}</p>
                    <p className="font-light">· {t("top.privacyDetail2")}</p>
                    <p className="font-light">· {t("top.privacyDetail3")}</p>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  );
}
