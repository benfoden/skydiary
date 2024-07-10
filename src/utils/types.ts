export interface EmailDetails {
  text: string;
  subject: string;
  body: string;
  code: string;
  goBack: string;
  safelyIgnore: string;
}

export type CommentType = "custom" | "criticism" | "insight" | "boost";
