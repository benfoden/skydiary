import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createTransport } from "nodemailer";
import { env } from "process";
import { Card } from "~/app/_components/Card";
import FormButton from "~/app/_components/FormButton";
import Input from "~/app/_components/Input";
import { type Locale } from "~/config";

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
                const server = {
                  host: env.EMAIL_SERVER_HOST,
                  port: Number(env.EMAIL_SERVER_PORT),
                  auth: {
                    user: env.EMAIL_SERVER_USER,
                    pass: env.EMAIL_SERVER_PASSWORD,
                  },
                };
                const from: string = formData.get("from") as string;

                const subject: string = formData.get("subject") as string;
                const body: string = formData.get("body") as string;

                const result = await createTransport(server).sendMail({
                  to: "contact@skydiary.app",
                  from,
                  subject,
                  text: "contact message",
                  html: `<body style="font-family: sans-serif; background: linear-gradient(to bottom, #cce3f1, #F3F6F6) no-repeat; background-size: cover; color: #000; padding: 32px 16px; text-align: center;">
                 User message: 
                  ${body}
                </body>`,
                });

                if (result) {
                  console.log("Email sent successfully!");
                } else {
                  console.error("Failed to send email.");
                }
              }}
              className=" space-y-4"
            >
              <div className="flex w-fit flex-col gap-4">
                <Input
                  label={t("contact.from")}
                  name="from"
                  type="email"
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
