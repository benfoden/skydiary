"use server";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import { sendEmail } from "~/utils/email";
import FormButton from "./FormButton";
import Input from "./Input";

export default async function EmailReferralForm() {
  const session = await getServerAuthSession();
  const userName = session?.user?.name ?? "a friend";
  return (
    <form
      action={async (formData) => {
        "use server";
        const to: string = formData.get("friendEmail") as string;
        const to2: string = (formData.get("friendEmail2") as string) ?? "";

        const firstName: string = formData.get("firstName") as string;
        const sendTos = [to, to2].filter((email) => email !== "");
        if (sendTos.length === 0) return;
        await Promise.all(
          sendTos.map(async (email) => {
            if (!email) return;
            await sendEmail({
              to: email,
              from: "invite@mail.skydiary.app",
              subject: `an invitation from ${firstName}`,
              textBody: `skydiary is a daily journal with private feedback from AI personas.`,
              htmlBody: `<body style="font-family: sans-serif; background: linear-gradient(to bottom, #cce3f1, #F3F6F6) no-repeat; background-size: cover; color: #000; padding: 32px 16px; text-align: center;">
                          <div style="padding: 32px;">
                            <h1 style="font-size: 24px;">invitation to skydiary</h1>
                            <p style="font-size: 16px;">skydiary is a daily journal app with strong encryption and private feedback from AI personas you can create. it's independently run by a husband and wife team based in kyoto, japan.</p>
                            <div style="margin: 32px 0;">
                              <a href="https://skydiary.app" style="background-color: #007BFF; color: #FFF; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px;">accept your invitation</a>
                            </div>
                          </div>
                        </body>`,
            }).catch((error) => {
              console.error("Email sending failed.", error);
              throw new Error(`Email sending failed.`);
            });
          }),
        );
        if (sendTos.length === 1) {
          return redirect("/home?st=1");
        }
        return redirect("/home?st=2");
      }}
      className="space-y-4"
    >
      <div className="flex w-full flex-col gap-8 md:max-w-96">
        <h2 className="text-2xl font-light">invite up to two friends</h2>
        <Input
          label="your first name"
          name="firstName"
          type="text"
          initialValue={userName ?? ""}
          required
        />
        <Input label="friend's email #1" name="to" type="email" required />
        <Input label="friend's email #2" name="to2" type="email" />
        <FormButton variant="submit" isSpecial>
          Invite
        </FormButton>
        <div className="flex flex-col gap-2 text-xs opacity-70">
          <p>we&apos;ll send your friends a link to try skydiary.</p>
          <p className="font-medium">
            in the future you&apos;ll both get a gift as a thank you from us!
          </p>
        </div>
      </div>
    </form>
  );
}
