"use client";
import { type Persona } from "@prisma/client";
import { PersonIcon, PlusIcon, StarFilledIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Button from "~/app/_components/Button";
import DropDownMenu from "~/app/_components/DropDown";
import { PersonaIcon } from "~/app/_components/PersonaIcon";
import Spinner from "~/app/_components/Spinner";

export default function PersonaSidebar({
  personas,
  isChat = false,
}: {
  personas: Persona[];
  isChat: boolean;
}) {
  const t = useTranslations();

  return (
    <>
      <div className="mb-4 hidden flex-col items-start justify-center gap-4 md:flex">
        <a href="/persona/all#newPersona" className="flex items-center gap-2">
          <Button variant="listItem">
            <div className="flex w-full flex-row items-center justify-between gap-2">
              <PersonIcon className="h-6 w-6" />
              {t("personas.add new")}
              <PlusIcon className="h-6 w-6" />
            </div>
          </Button>
        </a>
        {personas ? (
          <>
            {personas?.map((persona) =>
              isChat ? (
                <Button
                  key={persona.id}
                  variant="listItem"
                  onClick={(e) => {
                    e.preventDefault();
                    const url = new URL(window.location.href);
                    url.searchParams.set("persona", persona.id);
                    window.history.pushState({}, "", url);
                    window.location.reload();
                  }}
                >
                  <div className="flex w-full flex-row items-center justify-between gap-2">
                    <PersonaIcon personaId={persona.id} personas={personas} />
                    {persona?.name}
                    {persona?.isFavorite && (
                      <StarFilledIcon className="h-4 w-4" />
                    )}
                  </div>
                </Button>
              ) : (
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
              ),
            )}
          </>
        ) : (
          <div className="flex w-full flex-col items-center justify-center gap-4">
            <Spinner />
          </div>
        )}
      </div>
      <div className="mr-6 flex w-full flex-row justify-end md:hidden">
        <DropDownMenu>
          <a href="/persona/all#newPersona" className="flex items-center gap-2">
            <Button variant="listItem">
              <div className="flex w-full flex-row items-center justify-between gap-2">
                <PersonIcon className="h-6 w-6" />
                {t("personas.add new")}
                <PlusIcon className="h-6 w-6" />
              </div>
            </Button>
          </a>
          {personas ? (
            <>
              {personas?.map((persona) =>
                isChat ? (
                  <Button
                    key={persona.id}
                    variant="listItem"
                    onClick={(e) => {
                      e.preventDefault();
                      const url = new URL(window.location.href);
                      url.searchParams.set("persona", persona.id);
                      window.history.pushState({}, "", url);
                      window.location.reload();
                    }}
                  >
                    <div className="flex w-full flex-row items-center justify-between gap-2">
                      <PersonaIcon personaId={persona.id} personas={personas} />
                      {persona?.name}
                      {persona?.isFavorite && (
                        <StarFilledIcon className="h-4 w-4" />
                      )}
                    </div>
                  </Button>
                ) : (
                  <Link key={persona.id} href={`/persona/${persona.id}`}>
                    <Button variant="listItem">
                      <div className="flex w-full flex-row items-center justify-between gap-2">
                        <PersonaIcon
                          personaId={persona.id}
                          personas={personas}
                        />
                        {persona?.name}
                        {persona?.isFavorite && (
                          <StarFilledIcon className="h-4 w-4" />
                        )}
                      </div>
                    </Button>
                  </Link>
                ),
              )}
            </>
          ) : (
            <div className="flex w-full flex-col items-center justify-center gap-4">
              <Spinner />
            </div>
          )}
        </DropDownMenu>
      </div>
    </>
  );
}
