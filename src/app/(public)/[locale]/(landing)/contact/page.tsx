import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import postmark from "postmark";
import { Card } from "~/app/_components/Card";
import FormButton from "~/app/_components/FormButton";
import Input from "~/app/_components/Input";
import { type Locale } from "~/config";
import { getServerAuthSession } from "~/server/auth";
import { deleteContactEmailCookie } from "./helpers";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("contact.title"),
    description: t("contact.description"),
  };
}

export default async function Contact() {
  const t = await getTranslations();
  const contactEmail = cookies().get("contactEmail")?.value;
  const session = await getServerAuthSession();

  return (
    <div className="flex w-full flex-col items-start justify-start gap-2 sm:max-w-[768px]">
      <Card variant="form" isButton={false}>
        <h1 className="mb-4 text-lg font-medium">{t("contact.title")}</h1>
        <div className="flex flex-col items-start justify-start gap-2">
          <p>{t("contact.description")}</p>

          <div className="flex w-full flex-col items-start pt-8">
            <form
              action={async (formData) => {
                "use server";
                try {
                  await deleteContactEmailCookie().catch((error: Error) =>
                    console.error(error),
                  );

                  const client = new postmark.ServerClient(
                    "648fc4f7-a7c8-4211-8715-251d66e22762",
                  );

                  const from: string = formData.get("from") as string;

                  const subject: string = formData.get("subject") as string;
                  const body: string = formData.get("body") as string;

                  const result = await client.sendEmail({
                    To: "contact@skydiary.app",
                    From: from,
                    Subject: subject,
                    TextBody: body,
                    HtmlBody: `<body style="font-family: sans-serif; color: #000; padding: 32px 16px; text-align: center;">User message: 
                    ${body}
                    User account: ${session?.user?.email ?? "not logged in"}
                  </body>`,
                  });

                  if (result) {
                    redirect("/contact/thank-you");
                  }
                } catch (error) {
                  throw new Error("Failed to send email.");
                }
              }}
              className=" space-y-4"
            >
              <div className="flex w-fit flex-col gap-4">
                <Input
                  label={t("contact.from")}
                  name="from"
                  type="email"
                  initialValue={contactEmail}
                  disabled={!!contactEmail}
                  required
                />
                <Input
                  label={t("contact.subject")}
                  name="subject"
                  type="text"
                  required
                />
                <Input
                  label={t("contact.message")}
                  name="body"
                  type="textarea"
                  required
                />
                <FormButton variant="submit" isSpecial>
                  {t("contact.submit")}
                </FormButton>
              </div>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}
