"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ButtonSpinner from "~/app/_components/ButtonSpinner";
import { Card } from "~/app/_components/Card";
import FormButton from "~/app/_components/FormButton";
import Input from "~/app/_components/Input";

interface Props {
  email: string;
}

export default function OTPVerification({ email }: Props) {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const t = useTranslations();

  async function handleOTPVerification(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formattedEmail = encodeURIComponent(email.toLowerCase().trim());
    const formattedCode = encodeURIComponent(code);
    const otpRequestURL = `/api/auth/callback/email?email=${formattedEmail}&token=${formattedCode}`;
    const response = await fetch(otpRequestURL);

    if (response.ok) {
      router.replace("/auth/new-user");
    } else {
      setIsSubmitting(false);
      router.replace(`/auth/signin?error=Verification`);
    }
  }

  return (
    <>
      <h1 className="mb-8 text-xl font-light">{t("auth.almostSignedUp")}</h1>

      <Card variant="form">
        <form
          onSubmit={handleOTPVerification}
          className="flex flex-col gap-4 text-sm"
        >
          <Input
            label={t("auth.passcode")}
            name="code"
            id="code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <p>{t("auth.check your email", { email })}</p>
          <p>{t("auth.passcode expires")}</p>

          <FormButton
            variant="submit"
            isSpecial
            isDisabled={isSubmitting || !code || code.length !== 6}
          >
            {!isSubmitting ? t("auth.continue") : <ButtonSpinner />}
          </FormButton>
        </form>
      </Card>
      <p className="mb-4 mt-6 text-sm font-light opacity-80">
        <em>{t("form.or")}</em>
      </p>
      <Link
        href="#"
        className="text-sm font-medium opacity-80 hover:underline hover:opacity-100"
        onClick={() => {
          location.reload();
        }}
      >
        {t("auth.tryAgain")}
      </Link>
    </>
  );
}
