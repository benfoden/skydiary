"use client";
import { type Persona } from "@prisma/client";
import { PlusIcon, StarFilledIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Button from "~/app/_components/Button";
import { PersonaIcon } from "~/app/_components/PersonaIcon";

export default function PersonaSidebar({ personas }: { personas: Persona[] }) {
  const t = useTranslations();
  return (
    <div className="mb-4 flex flex-col items-start justify-center gap-4">
      <a href="/persona/all#newPersona" className="flex items-center gap-2">
        <Button>
          <PlusIcon className="h-5 w-5" /> {t("personas.add new")}
        </Button>
      </a>{" "}
      {personas && (
        <>
          {personas?.map((persona) => (
            <Link key={persona.id} href={`/persona/${persona.id}`}>
              <Button variant="listItem">
                <div className="flex w-full flex-row items-center justify-between gap-2">
                  <PersonaIcon personaId={persona.id} personas={personas} />
                  {persona?.isFavorite && (
                    <StarFilledIcon className="h-4 w-4" />
                  )}
                </div>
              </Button>
            </Link>
          ))}
        </>
      )}
    </div>
  );
}