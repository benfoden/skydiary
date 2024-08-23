"use server";
import { type User } from "@prisma/client";
import { Card } from "~/app/_components/Card";
import FormButton from "~/app/_components/FormButton";
import Input from "~/app/_components/Input";
import { api } from "~/trpc/server";
import { formatContent } from "~/utils/blog";
import { sendBroadcastEmail, sendEmail } from "~/utils/email";

export default async function NewsForm() {
  const users = await api.user.getAllUsersAsAdmin();
  const announcement = await api.blogPost.getLatestAnnouncement();

  return (
    <div className="container mx-auto flex flex-col gap-4 p-4">
      <h1 className="mb-4 text-2xl font-bold">Email</h1>
      <Card variant="form" isButton={false}>
        <form
          action={async (formData) => {
            "use server";
            if (users && announcement) {
              await Promise.all(
                users.map(async (user: User) => {
                  if (user.newAnnouncementId !== announcement?.id) return;
                  await api.user.updateUserAsAdmin({
                    targetUserId: user.id,
                    newAnnouncementId: formData.get("announcementId") as string,
                  });
                  const to = user.email;
                  const subject = announcement?.title;
                  const body = await formatContent(announcement?.content ?? "");
                  if (!to || !subject || !body) return;

                  await sendBroadcastEmail({
                    to,
                    from: "news@mail.skydiary.app",
                    subject,
                    textBody: subject,
                    htmlBody: `<body style="font-family: sans-serif; background: linear-gradient(to bottom, #cce3f1, #F3F6F6) no-repeat; background-size: cover; color: #000; padding: 32px 16px; text-align: center;">
                                ${body}
                                <div style="margin-top: 32px; margin-bottom: 8px;">
                                  <a href="{{{ pm:unsubscribe }}}" style="font-size: 10px;">unsubscribe from skydiary updates</a>
                                </div>
                              </body>`,
                  }).catch((error) => {
                    console.error("Email sending failed.", error);
                    throw new Error(`Email sending failed.`);
                  });
                }),
              );
            }
          }}
          className="flex flex-col gap-4"
        >
          <Input
            label="Announcement ID"
            name="announcementId"
            type="text"
            initialValue={announcement?.id}
          />

          <FormButton variant="submit" isSpecial>
            Publish and email announcement to all users
          </FormButton>
        </form>
      </Card>
      <Card variant="form" isButton={false}>
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
            <h2 className="text-2xl font-light">send single email to user</h2>
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
      </Card>
      <Card variant="form" isButton={false}>
        <form
          action={async (formData) => {
            "use server";

            const subject: string = formData.get("subject") as string;
            const body: string = formData.get("body") as string;
            if (!users) return;
            await Promise.all(
              users.map(async (user: User) => {
                if (!user.email) return;
                const to = user.email;
                await sendBroadcastEmail({
                  to,
                  from: "news@mail.skydiary.app",
                  subject,
                  textBody: subject,
                  htmlBody: `<body style="font-family: sans-serif; background: linear-gradient(to bottom, #cce3f1, #F3F6F6) no-repeat; background-size: cover; color: #000; padding: 32px 16px; text-align: center;">
                          ${body}
                          <div style="margin-top: 32px; margin-bottom: 8px;">
                            <a href="{{{ pm:unsubscribe }}}" style="font-size: 10px;">unsubscribe from skydiary updates</a>
                          </div>
                        </body>`,
                }).catch((error) => {
                  console.error("Email sending failed.", error);
                  throw new Error(`Email sending failed.`);
                });
              }),
            );
          }}
          className="space-y-4"
        >
          <div className="w-fit">
            <h2 className="text-2xl font-light">send email to all users</h2>
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
      </Card>
    </div>
  );
}
