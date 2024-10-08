import { type Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar } from "~/app/_components/Avatar";
import Button from "~/app/_components/Button";
import ManageBillingButton from "~/app/_components/ButtonBilling";
import { Card } from "~/app/_components/Card";
import DataSecurityCard from "~/app/_components/DataSecurity";
import DropDownUser from "~/app/_components/DropDownUser";
import FormButton from "~/app/_components/FormButton";
import FormDeleteButton from "~/app/_components/FormDeleteButton";
import Input from "~/app/_components/Input";
import LocaleSwitcher from "~/app/_components/LocaleSwitcher";
import { NavChevronLeft } from "~/app/_components/NavChevronLeft";
import { SessionNav } from "~/app/_components/SessionNav";
import { type Locale } from "~/config";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { getNewImageUrl } from "~/utils/_uploads";
import { ACTIVESTATUSES } from "~/utils/constants";
import { useMdkJwk } from "~/utils/useMdkJwk";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("settings.title"),
  };
}

export default async function Settings() {
  const t = await getTranslations();
  const locale: Locale = (await getLocale()) as Locale;
  const session = await getServerAuthSession();
  const mdkJwk = await useMdkJwk();

  const userPersona = await api.persona.getUserPersona({ mdkJwk });
  const subscription = await api.stripe.getUserSubDetails();

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
        <div className="container flex flex-col items-center justify-start gap-12 px-2 sm:w-96">
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
                const imageFile = formData.get("imageFile") as File;
                const occupation: string = formData.get("occupation") as string;
                const image = await getNewImageUrl({ imageFile });
                const isUser = true;

                try {
                  if (name) {
                    await api.user.update({ name, image });
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
                        occupation,
                        isUser,
                        mdkJwk,
                      });
                    }
                  }
                } catch (error) {
                  throw new Error("Error updating user");
                }
              }}
            >
              <Input
                id="name"
                name="name"
                initialValue={session?.user.name ?? ""}
                placeholder={t("settings.placeholderName")}
                required
                label={t("settings.your name")}
              />
              <Input
                type="number"
                id="age"
                name="age"
                placeholder="1"
                initialValue={userPersona?.age ?? 0}
                label={t("settings.your age")}
              />
              {session?.user?.image && (
                <Avatar
                  src={session?.user?.image ?? ""}
                  alt={session?.user?.name ?? "no username"}
                  size="medium"
                />
              )}
              <Input
                id="imageFile"
                name="imageFile"
                label={t("settings.profilePicture")}
                type="file"
              />
              <Input
                id="gender"
                name="gender"
                placeholder={t("settings.placeholder identities")}
                initialValue={userPersona?.gender ?? ""}
                label={t("settings.your identities")}
              />
              <Input
                id="occupation"
                name="occupation"
                placeholder={t("settings.occupationPlaceholder")}
                label={t("settings.occupation")}
                initialValue={userPersona?.occupation ?? ""}
              />

              <FormButton variant="submit">{t("form.save")}</FormButton>
            </form>
          </Card>
          {!session.user?.isSpecial && subscription && (
            <Card variant="form">
              <h2>{t("settings.billing")}</h2>
              <p>
                your billing status is:{" "}
                {subscription
                  ? JSON.stringify(subscription, null, 2)
                  : "not active"}
              </p>

              {/* todo: add active link when not in local dev, confirm email and everything works */}
              <ManageBillingButton locale={locale} />
              {subscription &&
                ACTIVESTATUSES.includes(subscription?.status ?? "none") && (
                  <form
                    action={async () => {
                      "use server";
                      try {
                        await api.stripe.cancelSubscription({
                          subId: subscription?.id,
                        });
                      } catch (error) {
                        throw new Error("Error cancelling subscription");
                      }
                    }}
                  >
                    <FormButton>Cancel your subscription</FormButton>
                  </form>
                )}
            </Card>
          )}

          <div id="data-security">
            <DataSecurityCard user={session?.user} />
          </div>

          <Card variant="form">
            <h2>{t("settings.language")}</h2>
            <div className="flex flex-row gap-2">
              <LocaleSwitcher isSettings />
            </div>
          </Card>
          <Card variant="form">
            <h2>{t("settings.exportData")}</h2>
            <p className="text-sm opacity-60">
              {t("settings.exportDataDescription")}
            </p>
            <Link href="/settings/export">
              <Button>{t("settings.exportDataButton")}</Button>
            </Link>
          </Card>
          <Card variant="form">
            <h2>{t("settings.deleteAccount")}</h2>
            <p className="text-sm opacity-60">
              {t("settings.deleteAccountDescription")}
            </p>
            {ACTIVESTATUSES.some((s) => s === subscription?.status) ? (
              <p className="text-base">
                {t("settings.unsubscribeBeforeDeleteAccount")}
              </p>
            ) : (
              <form
                action={async () => {
                  "use server";
                  try {
                    await api.user.deleteUser();
                  } catch (error) {
                    console.error("Error deleting user:", error);
                    throw new Error("Error deleting user");
                  }
                  redirect("/");
                }}
              >
                <FormDeleteButton
                  isDisabled={ACTIVESTATUSES.some(
                    (s) => s === subscription?.status,
                  )}
                >
                  <span className="text-red-500">
                    {t("settings.deleteAccountButton")}
                  </span>
                </FormDeleteButton>
              </form>
            )}
          </Card>
        </div>
      </main>
    </>
  );
}
