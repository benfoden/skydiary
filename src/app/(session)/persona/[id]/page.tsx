import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import PersonaFormFields from "~/app/(session)/persona/PersonaFormFields";
import { Card } from "~/app/_components/Card";
import DropDownUser from "~/app/_components/DropDownUser";
import FormButton from "~/app/_components/FormButton";
import FormDeleteButton from "~/app/_components/FormDeleteButton";
import { NavChevronLeft } from "~/app/_components/NavChevronLeft";
import { SessionNav } from "~/app/_components/SessionNav";
import { type Locale } from "~/config";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { getNewImageUrl } from "~/utils/_uploads";
import { isFavoritePersonaAvailable } from "~/utils/planDetails";
import UpgradeBanner from "../../../_components/UpgradeBanner";
import PersonaSidebar from "../Sidebar";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("personas.title"),
  };
}

export default async function Persona({ params }: { params: { id: string } }) {
  const session = await getServerAuthSession();

  if (!session?.user) return redirect("/auth/signin");
  const personaId = params.id;

  const personas = await api.persona.getAllByUserId();
  const persona = personas?.find((persona) => persona.id === personaId);
  if (!persona) return null;
  const t = await getTranslations();

  return (
    <>
      <SessionNav>
        <div className="flex items-center gap-2">
          <NavChevronLeft
            targetPathname={"/persona/all"}
            label={t("nav.personas")}
          />
        </div>
        <h1>{persona.name}</h1>
        <DropDownUser />
      </SessionNav>

      <main className="flex min-h-screen w-full flex-col items-center justify-start">
        <div className="container flex w-full flex-col items-center justify-start gap-12 px-2 pb-12">
          {!isFavoritePersonaAvailable(session?.user, personas) && (
            <UpgradeBanner variant="persona" />
          )}
          <div className="flex w-full flex-col items-center justify-center gap-4 md:flex-row md:items-start md:px-32">
            <PersonaSidebar personas={personas} />
            <div className="flex w-full flex-col items-center justify-center gap-4">
              <Card variant="form">
                <form
                  className="flex w-full max-w-lg flex-col items-center justify-center gap-4"
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

                    const imageFile =
                      (formData.get("imageFile") as File) ?? undefined;
                    const image = await getNewImageUrl({ imageFile });

                    let updated;
                    try {
                      const isFavoriteAvail = isFavoritePersonaAvailable(
                        session?.user,
                        personas,
                      );

                      const isFavorite = isFavoriteAvail
                        ? formData.get("isFavorite") === "on"
                        : persona.isFavorite;

                      if (name && traits) {
                        updated = await api.persona.update({
                          personaId,
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
                          mdkJwk,
                        });
                      }
                    } catch (error) {
                      throw new Error("Error updating persona");
                    }

                    if (updated) {
                      redirect("/persona/all");
                    }
                  }}
                >
                  <PersonaFormFields
                    personas={personas}
                    personaId={personaId}
                    user={session?.user}
                  />
                  <FormButton variant="submit">{t("form.update")}</FormButton>
                </form>
              </Card>
              <div className="flex w-full flex-row pt-8">
                <Card isButton={false}>
                  <form
                    action={async () => {
                      "use server";
                      await api.persona.delete({ personaId });
                      redirect("/persona/all");
                    }}
                  >
                    <h3 className="text-lg font-medium">
                      {t("personas.delete")}
                    </h3>
                    <div className="flex w-full flex-row items-center justify-center gap-2 pt-4">
                      <div className="w-fit">
                        <FormDeleteButton hasText={true} />
                      </div>
                    </div>
                  </form>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
