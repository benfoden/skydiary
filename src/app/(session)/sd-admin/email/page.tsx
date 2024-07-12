"use server";
import Input from "~/app/_components/Input";
import { sendEmail } from "~/utils/email";

export default async function EmailForm() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Send Test Email</h1>
      <form
        action={async (formData) => {
          "use server";
          const to: string = formData.get("to") as string;

          const subject: string = formData.get("subject") as string;
          const body: string = formData.get("body") as string;
          await sendEmail({
            to,
            from: "hi@mail.skydiary.app",
            subject,
            textBody: "test",
            htmlBody: `<body style="font-family: sans-serif; background: linear-gradient(to bottom, #cce3f1, #F3F6F6) no-repeat; background-size: cover; color: #000; padding: 32px 16px; text-align: center;">
                 ${body}
                </body>`,
          }).catch((error) => {
            console.error("Email sending failed.", error);
            throw new Error(`Email sending failed.`);
          });
        }}
        className="space-y-4"
      >
        <div className="w-fit">
          <Input label="To" name="to" type="email" required />
          <Input label="Subject" name="subject" type="text" required />
          <Input label="Body" name="body" type="text" required />
          <button
            type="submit"
            className="rounded-md bg-blue-500 px-4 py-2 text-white"
          >
            Send Email
          </button>
        </div>
      </form>
    </div>
  );
}
