"use client";
import { type Persona } from "@prisma/client";
import { PersonIcon, PlusIcon, StarFilledIcon } from "@radix-ui/react-icons";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Button from "~/app/_components/Button";
import { PersonaIcon } from "~/app/_components/PersonaIcon";
import Spinner from "~/app/_components/Spinner";
import { decryptPersona, getLocalMdkForUser } from "~/utils/cryptoA1";

export default function PersonaSidebar({ personas }: { personas: Persona[] }) {
  const t = useTranslations();
  const { data: sessionData } = useSession();
  const user = sessionData?.user;

  const [isLoading, setIsLoading] = useState(true);
  const [personaState, setPersonaState] = useState<Persona[]>([]);
  const decryptPersonas = useCallback(async () => {
    if (!user?.sukMdk) return;
    const mdk = await getLocalMdkForUser(user.sukMdk);
    try {
      const decryptedPersonas: Persona[] = await Promise.all(
        personas.map(async (persona) => {
          const decryptedPersona = await decryptPersona(persona, mdk);
          return decryptedPersona;
        }),
      );
      setPersonaState(decryptedPersonas);
    } catch (error) {
      console.error("Error decrypting personas", error);
    } finally {
      if (decryptPersonas.length) setIsLoading(false);
    }
  }, [personas, user?.sukMdk]);

  useEffect(() => {
    if (personas.some((p) => p.nameIV) && user?.sukMdk) {
      decryptPersonas().catch(() => {
        throw new Error("Error decrypting personas");
      });
    } else {
      setPersonaState(personas);
      setIsLoading(false);
    }
  }, [decryptPersonas, personas, user?.sukMdk]);
  return (
    <div className="mb-4 flex flex-col items-start justify-center gap-4">
      <a href="/persona/all#newPersona" className="flex items-center gap-2">
        <Button variant="listItem">
          <div className="flex w-full flex-row items-center justify-between gap-2">
            <PersonIcon className="h-6 w-6" />
            {t("personas.add new")}
            <PlusIcon className="h-6 w-6" />
          </div>
        </Button>
      </a>{" "}
      {personaState && !isLoading ? (
        <>
          {personaState?.map((persona) => (
            <Link key={persona.id} href={`/persona/${persona.id}`}>
              <Button variant="listItem">
                <div className="flex w-full flex-row items-center justify-between gap-2">
                  <PersonaIcon personaId={persona.id} personas={personas} />
                  {persona?.name}
                  {persona?.isFavorite && (
                    <StarFilledIcon className="h-4 w-4" />
                  )}
                </div>
              </Button>
            </Link>
          ))}
        </>
      ) : (
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <Spinner />
        </div>
      )}
    </div>
  );
}
