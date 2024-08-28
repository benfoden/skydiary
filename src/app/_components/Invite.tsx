"use client";
import { Cross2Icon } from "@radix-ui/react-icons";
import { redirect } from "next/navigation";
import { useState } from "react";
import { sendEmail } from "~/utils/email";
import Button from "./Button";
import FormButton from "./FormButton";
import Input from "./Input";
import Modal from "./Modal";

export default function Invite() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) return null;
  return !isOpen ? (
    <>
      <Button variant="chip" isSpecial onClick={() => setIsOpen(true)}>
        tell up to 2 friends
      </Button>
    </>
  ) : (
    <Modal>
      <div className="flex flex-row items-center justify-end">
        <Button variant="chip" onClick={() => setIsOpen(false)}>
          <Cross2Icon className="h-4 w-4" />
        </Button>
      </div>
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
          return redirect("/sd-admin/news");
        }}
        className="space-y-4"
      >
        <div className="w-fit">
          <h2 className="text-2xl font-light">send single email to user</h2>
          <Input label="To" name="to" type="email" required />
          <Input label="Subject" name="subject" type="text" required />
          <Input label="Body" name="body" type="text" required />
          <FormButton variant="submit" isSpecial>
            Send Email
          </FormButton>
        </div>
      </form>
    </Modal>
  );
}
