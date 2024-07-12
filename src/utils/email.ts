"use server";

import { postmarkClient } from "~/config";

export const sendEmail = async ({
  from,
  to,
  subject,
  textBody,
  htmlBody,
  MessageStream = "outbound",
}: {
  from: string;
  to: string;
  subject: string;
  textBody: string;
  htmlBody: string;
  MessageStream?: string;
}) => {
  "use server";
  const result = await postmarkClient.sendEmail({
    From: from,
    To: to,
    Subject: subject,
    TextBody: textBody,
    HtmlBody: htmlBody,
    MessageStream: MessageStream,
  });

  return result;
};
