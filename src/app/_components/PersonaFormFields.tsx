import { type Persona, type User } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { isFavoritePersonaAvailable } from "../(session)/persona/helpers";
import Input from "./Input";

export default async function PersonaFormFields({
  personas,
  personaId,
  user,
}: {
  personas: Persona[];
  personaId?: string;
  user: User;
}) {
  const persona = personas?.find((persona) => persona.id === personaId);
  const t = await getTranslations();

  //todo: add placeholder strings

  return (
    <div className="flex w-full flex-col gap-4">
      {JSON.stringify(persona)}
      <Input
        label={t("personas.favorite")}
        id="isFavorite"
        name="isFavorite"
        type="checkbox"
        checked={persona?.isFavorite ?? true}
        disabled={!isFavoritePersonaAvailable(user, personas)}
      />
      <Input
        label={t("personas.name")}
        id="name"
        name="name"
        placeholder={t("personas.namePlaceholder")}
        defaultValue={persona?.name ?? ""}
      />
      <Input
        type="textarea"
        label={t("personas.traits")}
        id="traits"
        name="traits"
        defaultValue={persona?.traits ?? ""}
        placeholder={t("personas.traitsPlaceholder")}
      />
      <Input
        type="textarea"
        label={t("personas.description")}
        id="description"
        name="description"
        defaultValue={persona?.description ?? ""}
        placeholder={t("personas.descriptionPlaceholder")}
      />
      <Input
        label={t("personas.image link")}
        id="image"
        name="image"
        placeholder="https://example.com/image.jpg"
      />
      <Input
        label={t("personas.age")}
        id="age"
        name="age"
        type="number"
        defaultValue={persona?.age ?? 20}
        placeholder={t("personas.agePlaceholder")}
      />
      <Input
        label={t("personas.identities")}
        id="gender"
        name="gender"
        placeholder={t("personas.identitiesPlaceholder")}
        defaultValue={persona?.gender ?? ""}
      />
      <Input
        label={t("personas.relationship")}
        id="relationship"
        name="relationship"
        defaultValue={persona?.relationship ?? ""}
        placeholder={t("personas.relationshipPlaceholder")}
      />
      <Input
        label={t("personas.occupation")}
        id="occupation"
        name="occupation"
        defaultValue={persona?.occupation ?? ""}
        placeholder={t("personas.occupationPlaceholder")}
      />
      <Input
        type="textarea"
        label={t("personas.communication style")}
        id="communicationStyle"
        name="communicationStyle"
        defaultValue={persona?.communicationStyle ?? ""}
        placeholder={t("personas.communicationStylePlaceholder")}
      />
      <Input
        type="textarea"
        label={t("personas.communication sample")}
        id="communicationSample"
        name="communicationSample"
        defaultValue={persona?.communicationSample ?? ""}
        placeholder={t("personas.communicationSamplePlaceholder")}
      />
    </div>
  );
}
