import { type Persona } from "@prisma/client";
import { PersonIcon } from "@radix-ui/react-icons";
import { Avatar } from "./Avatar";

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
    <div>
      {persona?.image ? (
        <Avatar alt={persona?.name} src={persona?.image} size="medium" />
      ) : (
        <PersonIcon className="h-8 w-8" />
      )}
    </div>
  );
};
