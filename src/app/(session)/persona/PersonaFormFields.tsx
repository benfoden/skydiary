import { type Persona, type User } from "@prisma/client";
import { PersonIcon, StarFilledIcon } from "@radix-ui/react-icons";
import { getTranslations } from "next-intl/server";
import { Avatar } from "~/app/_components/Avatar";
import DecryptedTextSpan from "~/app/_components/DecryptText";
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
      <div className="flex w-full flex-row items-center justify-center py-4 text-sm">
        <div className="flex flex-col items-center justify-center gap-2">
          {persona?.image ? (
            <Avatar alt={persona.name} src={persona.image} size="large" />
          ) : (
            <PersonIcon className="h-24 w-24" />
          )}
          <div className="flex flex-row items-center gap-2">
            <p className="text-lg">
              {persona?.nameIV ? (
                <DecryptedTextSpan
                  cipherText={persona.name}
                  iv={persona.nameIV}
                />
              ) : (
                persona?.name
              )}
            </p>
            {persona?.isFavorite && <StarFilledIcon className="h-5 w-5" />}
          </div>
        </div>
      </div>
      <div className="flex w-full flex-row gap-4">
        <Input
          label={t("personas.favorite")}
          id="isFavorite"
          name="isFavorite"
          type="checkbox"
          defaultChecked={persona?.isFavorite ? true : false}
          disabled={!isFavoritePersonaAvailable(user, personas)}
        />
        {persona?.isFavorite && <StarFilledIcon className="h-4 w-4" />}
      </div>
      <Input
        label={t("personas.name")}
        id="name"
        name="name"
        placeholder={t("personas.namePlaceholder")}
        initialValue={persona?.name ?? ""}
        iv={persona?.nameIV}
        maxLength={140}
        required
      />
      <Input
        label={t("personas.image")}
        type="file"
        id="imageFile"
        name="imageFile"
        fileSelectButtonLabel={t("new-user.chooseImage")}
      />
      <Input
        type="textarea"
        label={t("personas.traits")}
        id="traits"
        name="traits"
        initialValue={persona?.traits ?? ""}
        iv={persona?.traitsIV}
        placeholder={t("personas.traitsPlaceholder")}
        maxLength={140}
        required
      />
      <Input
        type="textarea"
        label={t("personas.description")}
        id="description"
        name="description"
        initialValue={persona?.description ?? ""}
        iv={persona?.descriptionIV}
        placeholder={t("personas.descriptionPlaceholder")}
        maxLength={700}
      />

      <Input
        label={t("personas.age")}
        id="age"
        name="age"
        type="number"
        initialValue={persona?.age ?? 20}
        placeholder={t("personas.agePlaceholder")}
        max={10000}
      />
      <Input
        label={t("personas.identities")}
        id="gender"
        name="gender"
        placeholder={t("personas.identitiesPlaceholder")}
        initialValue={persona?.gender ?? ""}
        iv={persona?.genderIV}
        maxLength={140}
      />
      <Input
        label={t("personas.relationship")}
        id="relationship"
        name="relationship"
        initialValue={persona?.relationship ?? ""}
        iv={persona?.relationshipIV}
        placeholder={t("personas.relationshipPlaceholder")}
        maxLength={140}
      />
      <Input
        label={t("personas.occupation")}
        id="occupation"
        name="occupation"
        initialValue={persona?.occupation ?? ""}
        iv={persona?.occupationIV}
        placeholder={t("personas.occupationPlaceholder")}
        maxLength={140}
      />
      <Input
        type="textarea"
        label={t("personas.communication style")}
        id="communicationStyle"
        name="communicationStyle"
        initialValue={persona?.communicationStyle ?? ""}
        iv={persona?.communicationStyleIV}
        placeholder={t("personas.communicationStylePlaceholder")}
        maxLength={140}
      />
      <Input
        type="textarea"
        label={t("personas.communication sample")}
        id="communicationSample"
        name="communicationSample"
        initialValue={persona?.communicationSample ?? ""}
        iv={persona?.communicationSampleIV}
        placeholder={t("personas.communicationSamplePlaceholder")}
        maxLength={1000}
      />
    </div>
  );
}
