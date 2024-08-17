import {
  type Comment,
  type Persona,
  type Post,
  type Tag,
} from "@prisma/client";

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
  | "tag"
  | "tagAndMemorize";

//todo: create types for JobQueue, and any necessary subtypes
//todo: should reuse the existing types for Post, Comment, and Persona

export type PostWithCommentsAndTags = Post & {
  comments?: Comment[];
  tags?: Tag[];
};

export interface PostsWithCommentsAndTagsAndPersonas {
  posts: PostWithCommentsAndTags[];
  personas: Persona[];
}

export type EncryptedCommentPartialResult = {
  id: string;
  content: string;
  contentIV: string;
  coachName?: string;
  coachNameIV?: string;
};

export type EncryptCommentPartialInput = {
  id: string;
  content: string;
  coachName?: string;
};

export type EncryptPostPartialInput = {
  id: string;
  content: string;
  summary?: string;
  comments?: EncryptCommentPartialInput[];
};

export type EncryptedPostPartialResult = {
  id: string;
  content: string;
  contentIV: string;
  summary?: string;
  summaryIV?: string;
  comments?: EncryptedCommentPartialResult[];
};
