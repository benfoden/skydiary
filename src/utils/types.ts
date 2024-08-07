export interface EmailDetails {
  text: string;
  subject: string;
  body: string;
  code: string;
  goBack: string;
  safelyIgnore: string;
}

export type CommentType = "custom" | "criticism" | "insight" | "boost";

export type JobType =
  | "encryptAndSave"
  | "decryptAndSave"
  | "memorize"
  | "genEmbed"
  | "summarize"
  | "tag";

//todo: create types for JobQueue, and any necessary subtypes
//todo: should reuse the existing types for Post, Comment, and Persona
