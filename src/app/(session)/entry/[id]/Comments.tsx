"use client";

import { type Comment, type Persona, type User } from "@prisma/client";
import { useLocale, useTranslations } from "next-intl";

export default function Comments({
  user,
  isLoading,
  comments,
  personas,
  postId,
}: {
  user: User;
  isLoading: boolean;
  comments: Comment[];
  personas?: Persona[];
  postId: string;
}) {
  const t = useTranslations();
  const locale = useLocale();

  return (
   
  );
}
