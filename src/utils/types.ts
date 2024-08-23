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
  id?: string;
  content: string;
  contentIV: string;
  coachName?: string;
  coachNameIV?: string;
};

export type EncryptCommentPartialInput = {
  id?: string;
  content: string;
  contentIV?: string;
  coachName?: string;
  coachNameIV?: string;
};

export type EncryptPostPartialInput = {
  id: string;
  content: string;
  contentIV?: string;
  summary?: string;
  summaryIV?: string;
  comments?: EncryptCommentPartialInput[];
};

export type EncryptedPostPartialResult = {
  id: string;
  content: string;
  contentIV?: string;
  summary?: string;
  summaryIV?: string;
  comments?: EncryptedCommentPartialResult[];
};

export type PersonaUpdateValues = {
  name: string | undefined;
  nameIV?: string | null;
  nameIVBytes?: Buffer | null;
  traits: string | undefined;
  traitsIV?: string | null;
  traitsIVBytes?: Buffer | null;
  image: string | undefined;
  age: number | undefined;
  description: string | undefined;
  descriptionIV?: string | undefined;
  descriptionIVBytes?: Buffer | null;
  gender: string | null;
  genderIV?: string | undefined;
  genderIVBytes?: Buffer | null;
  relationship: string | undefined;
  relationshipIV?: string | undefined;
  relationshipIVBytes?: Buffer | null;
  occupation: string | undefined;
  occupationIV?: string | undefined;
  occupationIVBytes?: Buffer | null;
  communicationStyle: string | undefined;
  communicationStyleIV?: string | undefined;
  communicationStyleIVBytes?: Buffer | null;
  communicationSample: string | undefined;
  communicationSampleIV?: string | undefined;
  communicationSampleIVBytes?: Buffer | null;
  isFavorite: boolean | undefined;
  isUser: boolean | undefined;
};

export type PersonaCreateValues = {
  name: string;
  nameIV?: string | null;
  nameIVBytes?: Buffer | null;
  traits: string;
  traitsIV?: string | null;
  traitsIVBytes?: Buffer | null;
  image: string | undefined;
  age: number | undefined;
  description: string | undefined;
  descriptionIV?: string | undefined;
  descriptionIVBytes?: Buffer | null;
  gender: string | null;
  genderIV?: string | undefined;
  genderIVBytes?: Buffer | null;
  relationship: string | undefined;
  relationshipIV?: string | undefined;
  relationshipIVBytes?: Buffer | null;
  occupation: string | undefined;
  occupationIV?: string | undefined;
  occupationIVBytes?: Buffer | null;
  communicationStyle: string | undefined;
  communicationStyleIV?: string | undefined;
  communicationStyleIVBytes?: Buffer | null;
  communicationSample: string | undefined;
  communicationSampleIV?: string | undefined;
  communicationSampleIVBytes?: Buffer | null;
  isFavorite: boolean | undefined;
  isUser: boolean | undefined;
};

export type BlogTag = "announcement" | "how-to" | "incident" | "interesting";
export const BLOGTAGS = ["announcement", "how-to", "incident", "interesting"];
