import { type Persona, type User } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { isFavoritePersonaAvailable } from "~/utils/planDetails";
import Input from "../../_components/Input";

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

  return (
    <div className="flex w-full flex-col gap-4">
      <Input
        label={t("personas.favorite")}
        id="isFavorite"
        name="isFavorite"
        type="checkbox"
        defaultChecked={persona?.isFavorite ? true : false}
        disabled={!isFavoritePersonaAvailable(user, personas)}
      />
      <Input
        label={t("personas.name")}
        id="name"
        name="name"
        placeholder={t("personas.namePlaceholder")}
        defaultValue={persona?.name ?? ""}
        maxLength={140}
        required
      />
      <Input
        type="textarea"
        label={t("personas.traits")}
        id="traits"
        name="traits"
        defaultValue={persona?.traits ?? ""}
        placeholder={t("personas.traitsPlaceholder")}
        maxLength={140}
        required
      />
      <Input
        type="textarea"
        label={t("personas.description")}
        id="description"
        name="description"
        defaultValue={persona?.description ?? ""}
        placeholder={t("personas.descriptionPlaceholder")}
        maxLength={700}
      />
      {persona?.image && (
        <Image src={persona.image} alt={persona.name} width={64} height={64} />
      )}
      {persona?.image}
      <Input
        label={t("personas.image")}
        type="file"
        id="imageFile"
        name="imageFile"
      />
      <Input
        label={t("personas.age")}
        id="age"
        name="age"
        type="number"
        defaultValue={persona?.age ?? 20}
        placeholder={t("personas.agePlaceholder")}
        max={10000}
      />
      <Input
        label={t("personas.identities")}
        id="gender"
        name="gender"
        placeholder={t("personas.identitiesPlaceholder")}
        defaultValue={persona?.gender ?? ""}
        maxLength={140}
      />
      <Input
        label={t("personas.relationship")}
        id="relationship"
        name="relationship"
        defaultValue={persona?.relationship ?? ""}
        placeholder={t("personas.relationshipPlaceholder")}
        maxLength={140}
      />
      <Input
        label={t("personas.occupation")}
        id="occupation"
        name="occupation"
        defaultValue={persona?.occupation ?? ""}
        placeholder={t("personas.occupationPlaceholder")}
        maxLength={140}
      />
      <Input
        type="textarea"
        label={t("personas.communication style")}
        id="communicationStyle"
        name="communicationStyle"
        defaultValue={persona?.communicationStyle ?? ""}
        placeholder={t("personas.communicationStylePlaceholder")}
        maxLength={140}
      />
      <Input
        type="textarea"
        label={t("personas.communication sample")}
        id="communicationSample"
        name="communicationSample"
        defaultValue={persona?.communicationSample ?? ""}
        placeholder={t("personas.communicationSamplePlaceholder")}
        maxLength={1000}
      />
    </div>
  );
}
