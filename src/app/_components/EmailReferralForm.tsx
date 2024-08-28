import { redirect } from "next/navigation";
import { sendEmail } from "~/utils/email";
import FormButton from "./FormButton";
import Input from "./Input";

export default function EmailReferralForm({ userName }: { userName?: string }) {
  userName = userName ?? "a friend";
  return (
    <form
      action={async (formData) => {
        "use server";
        const to: string = formData.get("friendEmail") as string;

        const firstName: string = formData.get("firstName") as string;
        await sendEmail({
          to,
          from: "invite@mail.skydiary.app",
          subject: `an invitation from ${firstName}`,
          textBody: `skydiary is a new journal with private feedback from AI personas.`,
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
        return redirect("/sd-admin/news");
      }}
      className="space-y-4"
    >
      <div className="w-fit">
        <h2 className="text-2xl font-light">
          invite up to two friends to try skydiary
        </h2>
        <Input
          label="your first name"
          name="firstName"
          type="text"
          initialValue={userName ?? ""}
          required
        />
        <Input label="your friend's email" name="to" type="email" required />
        <FormButton variant="submit" isSpecial>
          Send
        </FormButton>
        <div className="text-xs opacity-70">
          we&apos;ll send your friend a link to try skydiary and in the future
          you&apos;ll both get a gift.
        </div>
      </div>
    </form>
  );
}
