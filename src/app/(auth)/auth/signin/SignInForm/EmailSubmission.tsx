"use client";

import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "~/app/_components/Card";
import FormButton from "~/app/_components/FormButton";
import Input from "~/app/_components/Input";
import { deleteSignUpEmailCookie } from "../helpers";

interface Props {
  signUpEmail: string;
  onSubmit: (email: string) => void;
}

export default function EmailSubmission({ signUpEmail, onSubmit }: Props) {
  const locale = useLocale();
  const [email, setEmail] = useState(signUpEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const t = useTranslations();

  async function handleEmailSubmission(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const response = await signIn("email", { email, redirect: false });

    if (response?.error) {
      if (response?.url) {
        router.push(response.url);
      } else {
        router.replace(
          `${locale}/auth/signin?error=${encodeURIComponent(response.error)}`,
        );
      }
    } else {
      onSubmit(email);
    }

    setIsSubmitting(false);
  }

  useEffect(() => {
    deleteSignUpEmailCookie().catch((error: Error) => console.error(error));
  }, []);

  return (
    <Card variant="form">
      <form onSubmit={handleEmailSubmission} className="flex flex-col gap-4">
        <Input
          label={t("auth.email")}
          type="email"
          placeholder="email@example.com"
          name="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <FormButton variant="submit" isDisabled={isSubmitting} isSpecial>
          {isSubmitting ? t("auth.signing in") : t("auth.sign in")}
        </FormButton>
        <p className="text-xs opacity-70">
          {t.rich("auth.privacyAndTerms", {
            privacyLink: (chunks) => (
              <Link href="/privacy" className="font-bold">
                {chunks}
              </Link>
            ),
            termsLink: (chunks) => (
              <Link href="/terms" className="font-bold">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </form>
    </Card>
  );
}
