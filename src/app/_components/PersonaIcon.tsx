import { type Persona } from "@prisma/client";
import { PersonIcon } from "@radix-ui/react-icons";
import Image from "next/image";

export const PersonaIcon = ({
  personaId,
  personas,
  coachVariant,
}: {
  personaId: string;
  personas?: Persona[];
  coachVariant?: string;
}) => {
  if (!personaId && coachVariant)
    return (
      <div className="flex items-center gap-2 opacity-70">
        <PersonIcon className="h-8 w-8" />
        <p className="italic">sky {coachVariant}</p>
      </div>
    );
  const persona = personas?.find((persona) => persona.id === personaId);

  return (
    <div className="flex flex-row items-center gap-2">
      {persona?.image ? (
        <Image
          alt={persona?.name}
          src={persona?.image}
          width="0"
          height="0"
          className="h-auto w-6 rounded-full"
        />
      ) : (
        <PersonIcon className="h-6 w-6" />
      )}
      <p>{persona?.name}</p>
    </div>
  );
};
