"use server";

import { postmarkClient } from "~/utils/postmark";
import { formatContent } from "./blog";

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

export const sendBroadcastEmail = async ({
  from,
  to,
  subject,
  textBody,
  htmlBodyString,
  MessageStream = "broadcast",
}: {
  from: string;
  to: string;
  subject: string;
  textBody: string;
  htmlBodyString: string;
  MessageStream?: string;
}) => {
  "use server";

  const body = await formatContent(htmlBodyString);

  const result = await postmarkClient.sendEmail({
    From: from,
    To: to,
    Subject: subject,
    TextBody: textBody,
    HtmlBody: `<body style="font-family: sans-serif; background: linear-gradient(to bottom, #cce3f1, #F3F6F6) no-repeat; background-size: cover; color: #000; padding: 32px 16px; text-align: center;">
                ${body}
                <div style="margin-top: 32px; margin-bottom: 8px;">
                  <a href="{{{ pm:unsubscribe }}}" style="font-size: 10px;">unsubscribe from skydiary updates</a>
                </div>
              </body>`,
    MessageStream: MessageStream,
  });

  return result;
};
