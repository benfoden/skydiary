"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
    const formattedCallback = encodeURIComponent("/auth/verified");
    const otpRequestURL = `/api/auth/callback/email?email=${formattedEmail}&token=${formattedCode}&callbackUrl=${formattedCallback}`;
    const response = await fetch(otpRequestURL);

    //todo: why is this required?
    if (response.url.includes("/auth/verified")) {
      router.replace("/home");
    }
    if (!response) {
      setIsSubmitting(false);
      router.replace(`/auth/signin?error=Verification`);
    }
  }

  return (
    <>
      <Card variant="form">
        <form onSubmit={handleOTPVerification}>
          <div className="my-8 flex w-full flex-col gap-4 text-sm font-light">
            <Input
              label={t("auth.passcode")}
              name="code"
              id="code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <p>{t("auth.check your email")}</p>
            <p>{t("auth.passcode expires")}</p>

            <FormButton
              variant="submit"
              isSpecial
              isDisabled={isSubmitting || !code || code.length !== 6}
            >
              {isSubmitting
                ? t("auth.verifying")
                : t("auth.verify and continue")}
            </FormButton>
          </div>
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
