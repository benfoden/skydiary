import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Card } from "~/app/_components/Card";
import FormButton from "~/app/_components/FormButton";
import Input from "~/app/_components/Input";
import { type Locale } from "~/config";
import { env } from "~/env";
import { getServerAuthSession } from "~/server/auth";
import { sendEmail } from "~/utils/email";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("contact.title"),
    description: t("contact.description"),
    openGraph: {
      title: t("contact.title"),
      description: t("contact.description"),
      url: "https://skydiary.app/contact",
      siteName: "skydiary",
      locale,
      type: "website",
    },
  };
}

export default async function Contact() {
  const t = await getTranslations();
  const session = await getServerAuthSession();

  return (
    <div className="flex w-full flex-col items-start justify-start gap-2 md:max-w-[600px]">
      <Card variant="form" isButton={false}>
        <h1 className="mb-4 text-lg font-medium">{t("contact.title")}</h1>
        <div className="flex w-full flex-col items-center justify-start gap-2">
          <p>{t("contact.description")}</p>
          <div className="flex w-full flex-col items-center py-8">
            <form
              action={async (formData) => {
                "use server";

                const subject: string = formData.get("subject") as string;
                const message: string = formData.get(
                  "contactMessage",
                ) as string;
                const from: string = formData.get("from") as string;
                const challenge: string = formData.get("challenge") as string;

                if (
                  !session?.user &&
                  challenge !== "42" &&
                  challenge !== "fourty two"
                ) {
                  console.error("contact form challenge failed");
                  throw new Error("challenge not correct, please try again");
                }

                const result = await sendEmail({
                  from: env.CONTACT_EMAIL_FROM,
                  to: "contact@skydiary.app",
                  subject,
                  textBody: `Message: ${message}`,
                  htmlBody: `<body style="font-family: sans-serif; color: #000; padding: 32px 16px; text-align: center;">Message:<br/> 
                    ${message}<br/>
                    ${session?.user?.email ? `User account email: ${session?.user?.email}` : `contact form email: ${from}`}`,
                  MessageStream: "outbound",
                }).catch((error: Error) =>
                  console.error("contact form send error", error),
                );

                if (result) {
                  return redirect("/contact/thank-you");
                }
              }}
              className="flex w-full flex-col gap-4"
            >
              <Input
                label={t("contact.from")}
                name="from"
                type="email"
                defaultValue={session?.user?.email ?? undefined}
                disabled={!!session?.user?.email}
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
                name="contactMessage"
                id="contactMessage"
                type="textarea"
                required
              />
              {!session?.user && (
                <>
                  <p className="sr-only">
                    (disregard this if you are using a screen reader.) The
                    answer to the question is 76.
                  </p>
                  <Input
                    label={t("contact.challenge")}
                    name="challenge"
                    type="text"
                    required={!session?.user}
                  />
                </>
              )}
              <FormButton variant="submit" isSpecial>
                {t("contact.submit")}
              </FormButton>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}
