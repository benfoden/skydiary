import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import PersonaFormFields from "~/app/(session)/persona/PersonaFormFields";
import { Card } from "~/app/_components/Card";
import DropDownUser from "~/app/_components/DropDownUser";
import EncryptionNotice from "~/app/_components/EncryptionNotice";
import FormButton from "~/app/_components/FormButton";
import { NavChevronLeft } from "~/app/_components/NavChevronLeft";
import { SessionNav } from "~/app/_components/SessionNav";
import { type Locale } from "~/config";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { getNewImageUrl } from "~/utils/_uploads";
import { isFavoritePersonaAvailable } from "~/utils/planDetails";
import { useMdkJwk } from "~/utils/useMdkJwk";
import UpgradeBanner from "../../../_components/UpgradeBanner";
import PersonaSidebar from "../Sidebar";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t(`personas.title`),
  };
}

export default async function Persona() {
  const session = await getServerAuthSession();
  const { user } = session;
  const mdkJwk = await useMdkJwk();
  if (!session?.user) return redirect("/auth/signin");
  const t = await getTranslations();

  const personas = await api.persona.getAllByUserId({ mdkJwk });

  return (
    <>
      <SessionNav>
        <div className="flex items-center gap-2">
          <NavChevronLeft targetPathname={"/home"} label={t("nav.home")} />
        </div>
        <h1>{t("nav.personas")}</h1>
        <DropDownUser />
      </SessionNav>

      <main className="flex min-h-screen w-full flex-col items-center justify-start">
        {user?.passwordSalt && !mdkJwk ? (
          <EncryptionNotice />
        ) : (
          <>
            <div className="container flex flex-col items-center justify-start gap-12 px-2 pb-12">
              {!isFavoritePersonaAvailable(session?.user, personas) && (
                <UpgradeBanner variant="persona" />
              )}
              <div className="flex w-full flex-col items-center justify-center gap-4 md:flex-row md:items-start md:px-32">
                <PersonaSidebar personas={personas} />
                <div
                  id="newPersona"
                  className="mb-4 flex flex-col items-start justify-center gap-4 md:w-full"
                >
                  <Card variant="form">
                    <h2 className="mb-2 text-lg font-medium">
                      {t("personas.new persona")}
                    </h2>
                    <p className="text-sm opacity-60">
                      {t("personas.newDescription")}
                    </p>
                    <form
                      className="flex flex-col items-start justify-center gap-4"
                      action={async (formData) => {
                        "use server";
                        const name: string = formData.get("name") as string;
                        const traits: string = formData.get("traits") as string;
                        const description: string = formData.get(
                          "description",
                        ) as string;
                        const age = Number(formData.get("age"));
                        const gender: string = formData.get("gender") as string;
                        const relationship: string = formData.get(
                          "relationship",
                        ) as string;
                        const occupation: string = formData.get(
                          "occupation",
                        ) as string;
                        const communicationStyle: string = formData.get(
                          "communicationStyle",
                        ) as string;
                        const communicationSample: string = formData.get(
                          "communicationSample",
                        ) as string;

                        const imageFile = formData.get("imageFile") as File;
                        const image = await getNewImageUrl({ imageFile });

                        let created;
                        try {
                          const isFavorite = isFavoritePersonaAvailable(
                            session?.user,
                            personas,
                          )
                            ? formData.get("isFavorite") === "on"
                            : false;

                          if (name && traits) {
                            created = await api.persona.create({
                              name,
                              traits,
                              description,
                              image,
                              age,
                              gender,
                              relationship,
                              occupation,
                              communicationStyle,
                              communicationSample,
                              isFavorite,
                            });
                          }
                        } catch (error) {
                          throw new Error("Error creating persona");
                        }
                        if (created) {
                          redirect(`/persona/${created.id}`);
                        }
                      }}
                    >
                      <PersonaFormFields
                        personas={personas}
                        user={session?.user}
                      />
                      <FormButton variant="submit">
                        {t("form.create")}
                      </FormButton>
                    </form>
                  </Card>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
