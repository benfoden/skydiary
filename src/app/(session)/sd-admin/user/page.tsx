import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Card } from "~/app/_components/Card";
import CopyText from "~/app/_components/CopyText";
import FormButton from "~/app/_components/FormButton";
import Input from "~/app/_components/Input";
import { env } from "~/env";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { useMdkJwk } from "~/utils/useMdkJwk";

export default async function Secret({
  searchParams,
}: {
  searchParams?: { targetUserId?: string };
}) {
  const mdkJwk = await useMdkJwk();
  const session = await getServerAuthSession();
  const userPersona = await api.persona.getUserPersona({ mdkJwk });
  const t = await getTranslations();

  const users = await api.user.getAllUsersAsAdmin();

  const targetUser = await api.user.getById({
    userId: searchParams?.targetUserId ?? "",
  });

  return (
    <div className="flex w-full flex-col gap-4 sm:flex-row">
      <Card variant="form">
        <div className="flex w-full flex-col gap-4">
          <h2>{userPersona?.name}</h2>
          <form
            className="flex w-full flex-col gap-4"
            action={async (formData) => {
              "use server";
              const name: string = formData.get("name") as string;
              const age = Number(formData.get("age"));
              const gender: string = formData.get("gender") as string;
              const traits: string = formData.get("traits") as string;
              const description: string = formData.get("description") as string;
              const relationship: string = formData.get(
                "relationship",
              ) as string;
              const occupation: string = formData.get("occupation") as string;
              const communicationStyle: string = formData.get(
                "communicationStyle",
              ) as string;
              const communicationSample: string = formData.get(
                "communicationSample",
              ) as string;
              const isUser = true;

              if (name && userPersona) {
                try {
                  await api.user.updateUser({ name });
                  await api.persona.update({
                    mdkJwk,
                    personaId: userPersona?.id,
                    name,
                    age,
                    gender,
                    traits,
                    description,
                    relationship,
                    occupation,
                    communicationStyle,
                    communicationSample,
                    isUser,
                  });
                } catch (error) {
                  console.error("Error updating user:", error);
                }
              }
            }}
          >
            <Input
              id="name"
              name="name"
              placeholder={t("settings.placeholderName")}
              required
              label={t("personas.name")}
              defaultValue={session?.user.name ?? ""}
            />
            <Input
              type="number"
              id="age"
              name="age"
              required
              placeholder="1"
              defaultValue={userPersona?.age ?? 0}
              label={t("personas.age")}
            />
            <Input
              id="gender"
              name="gender"
              required
              placeholder={t("settings.placeholder identities")}
              defaultValue={userPersona?.gender ?? ""}
              label={t("personas.identities")}
            />
            <Input
              type="textarea"
              id="traits"
              name="traits"
              label={t("personas.traits")}
              defaultValue={userPersona?.traits ?? ""}
              maxLength={280}
            />
            <Input
              type="textarea"
              id="description"
              name="description"
              label={t("personas.description")}
              defaultValue={userPersona?.description ?? ""}
              maxLength={1700}
            />
            <Input
              type="textarea"
              id="relationship"
              name="relationship"
              label={t("personas.relationship")}
              defaultValue={userPersona?.relationship ?? ""}
              maxLength={140}
            />
            <Input
              id="occupation"
              name="occupation"
              label={t("personas.occupation")}
              defaultValue={userPersona?.occupation ?? ""}
            />
            <Input
              id="communicationStyle"
              name="communicationStyle"
              label={t("personas.communication style")}
              defaultValue={userPersona?.communicationStyle ?? ""}
            />
            <Input
              id="communicationSample"
              name="communicationSample"
              label={t("personas.communication sample")}
              defaultValue={userPersona?.communicationSample ?? ""}
            />
            <FormButton variant="submit">{t("form.save")}</FormButton>
          </form>
        </div>
      </Card>
      <Card variant="form">
        <div className="flex w-full flex-col gap-4">
          <h2>Update User</h2>
          <form
            action={async (formData) => {
              "use server";
              const targetUserId: string = formData.get(
                "targetUserId",
              ) as string;
              const email: string | undefined = formData.get("email") as string;
              const stripeProductId: string | undefined = formData.get(
                "stripeProductId",
              ) as string;
              const isAdmin: boolean = formData.get("isAdmin") === "on";
              const isSpecial: boolean = formData.get("isSpecial") === "on";

              let stripeProdId: string | undefined = stripeProductId;
              if (!stripeProductId) {
                stripeProdId = env.PRODUCT_ID_LITE;
              }
              const updateData = {
                targetUserId,
                ...(email ? { email } : {}),
                ...(isAdmin !== undefined ? { isAdmin } : {}),
                ...(isSpecial !== undefined ? { isSpecial } : {}),
                ...(stripeProdId ? { stripeProductId: stripeProdId } : {}),
              };

              await api.user.updateUserAsAdmin(updateData);

              revalidatePath("/sd-admin/user");
              redirect(`/sd-admin/user`);
            }}
          >
            <Input
              id="targetUserId"
              name="targetUserId"
              label="Target User Id *"
              defaultValue={targetUser?.id}
            />
            <Input
              id="email"
              name="email"
              label="Email"
              defaultValue={targetUser?.email ?? ""}
            />
            <Input
              id="isAdmin"
              name="isAdmin"
              label="Is Admin"
              type="checkbox"
              defaultChecked={targetUser?.isAdmin}
            />
            <Input
              id="isSpecial"
              name="isSpecial"
              label="Is Special"
              type="checkbox"
              defaultChecked={targetUser?.isSpecial}
            />
            <Input
              id="stripeProduct"
              name="stripeProductId"
              label="Stripe Product Id"
              defaultValue={targetUser?.stripeProductId ?? ""}
            />
            <Input
              id="newAnnouncementId"
              name="newAnnouncementId"
              label="New Announcement Id"
              defaultValue={targetUser?.newAnnouncementId ?? ""}
            />

            <FormButton variant="submit">Update user</FormButton>
          </form>
        </div>
        <div className="flex w-full flex-col items-start gap-4 pt-8">
          <h2>Current admin user</h2>
          <div className="w-80">{JSON.stringify(session?.user, null, 2)}</div>

          <div className="w-80">comments used: {session.user.commentsUsed}</div>
          <div className="w-80">
            custom personas used: {session.user.personasUsed}
          </div>
        </div>
      </Card>
      <Card variant="form">
        <div className="flex w-full flex-col gap-4">
          <h2>{users?.length} users</h2>
          {users?.map((user) => (
            <details key={user.id}>
              <summary>{user.name ?? user.email}</summary>
              <div>
                id: <CopyText value={user.id} />
              </div>
              <div>
                name: <CopyText value={user.name ?? ""} />
              </div>
              <div>
                email: <CopyText value={user.email!} />
              </div>
              <div>isAdmin: {user.isAdmin ? "true" : "false"}</div>
              <div>isSpecial: {user.isSpecial ? "true" : "false"}</div>
              <div>stripeProductId: {user.stripeProductId}</div>
              <div>newAnnouncementId: {user.newAnnouncementId}</div>
              <form
                action={async () => {
                  "use server";
                  redirect(`/sd-admin/user?targetUserId=${user.id}`);
                }}
              >
                <FormButton
                  variant="submit"
                  isDisabled={searchParams?.targetUserId === user.id}
                >
                  Send to update form
                </FormButton>
              </form>
            </details>
          ))}
        </div>
      </Card>
    </div>
  );
}
