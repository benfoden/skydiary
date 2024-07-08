import { PlusIcon, StarIcon } from "@radix-ui/react-icons";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import Button from "~/app/_components/Button";
import { Card } from "~/app/_components/Card";
import DropDownUser from "~/app/_components/DropDownUser";
import FormButton from "~/app/_components/FormButton";
import { NavChevronLeft } from "~/app/_components/NavChevronLeft";
import PersonaFormFields from "~/app/_components/PersonaFormFields";
import { PersonaIcon } from "~/app/_components/PersonaIcon";
import { SessionNav } from "~/app/_components/SessionNav";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { productPlan } from "~/utils/constants";

export default async function Persona() {
  const session = await getServerAuthSession();
  if (!session?.user) return redirect("/auth/signin");
  const t = await getTranslations();

  const personas = await api.persona.getAllByUserId();
  return (
    <>
      <SessionNav>
        <div className="flex items-center gap-2">
          <NavChevronLeft targetPathname={"/today"} label={t("nav.today")} />
        </div>
        <h1>{t("nav.personas")}</h1>
        <DropDownUser />
      </SessionNav>

      <main className="flex min-h-screen w-full flex-col items-center justify-start">
        <div className="container flex flex-col items-center justify-start gap-12 px-2 pb-12 ">
          <div className="flex w-full flex-col items-center justify-center gap-4 border-zinc-900 md:flex-row md:items-start md:px-32">
            <div className="mb-4 flex flex-col items-start justify-center gap-4">
              <a href="#newPersona" className="flex items-center gap-2">
                <Button>
                  <PlusIcon className="h-5 w-5" /> {t("personas.add new")}
                </Button>
              </a>{" "}
              {personas && (
                <>
                  {personas?.map((persona) => (
                    <Link key={persona.id} href={`/persona/${persona.id}`}>
                      <Button variant="listItem">
                        <PersonaIcon
                          personaId={persona.id}
                          personas={personas}
                        />
                        {persona?.isFavorite && (
                          <StarIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </Link>
                  ))}
                </>
              )}
            </div>
            <div
              id="newPersona"
              className="mb-4 flex flex-col items-start justify-center gap-4 sm:w-full"
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
                    const image: string = formData.get("image") as string;
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

                    let isFavorite = false;
                    if (
                      personas?.length >
                      productPlan(session?.user?.stripeProductId)?.personas
                    ) {
                      isFavorite = formData.get("isFavorite") === "on";
                    }

                    if (name && traits) {
                      try {
                        await api.persona.create({
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
                      } catch (error) {
                        console.error("Error updating persona:", error);
                      }
                      revalidatePath("/persona/all");
                      redirect("/persona/all");
                    }
                  }}
                >
                  <PersonaFormFields personas={personas} user={session?.user} />
                  <FormButton variant="submit">{t("form.create")}</FormButton>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
