"use server";
import { createTransport } from "nodemailer";
import Input from "~/app/_components/Input";
import { env } from "~/env";

export default async function EmailForm() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Send Test Email</h1>
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
          const to: string = formData.get("to") as string;

          const subject: string = formData.get("subject") as string;
          const body: string = formData.get("body") as string;

          const result = await createTransport(server).sendMail({
            to,
            from: "hi@mail.skydiary.app",
            subject,
            text: "test",
            html: `<body style="font-family: sans-serif; background: linear-gradient(to bottom, #cce3f1, #F3F6F6) no-repeat; background-size: cover; color: #000; padding: 32px 16px; text-align: center;">
                 ${body}
                </body>`,
          });

          if (result) {
            console.log("Email sent successfully!");
          } else {
            console.error("Failed to send email.");
          }
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
