"use client";
import { ArrowRightIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "~/app/_components/Button";
import ButtonSpinner from "~/app/_components/ButtonSpinner";
import { Card } from "~/app/_components/Card";
import FormButton from "~/app/_components/FormButton";
import { api } from "~/trpc/react";

export default function Upgrade() {
  const { mutateAsync: createCheckoutSession } =
    api.stripe.createCheckoutSession.useMutation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("pricing");

  const [checkoutStatus, setCheckoutStatus] = useState("");
  const [isYearly, setIsYearly] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkoutSuccess = searchParams.get("checkoutSuccess");
    const checkoutCanceled = searchParams.get("checkoutCanceled");

    if (checkoutSuccess) {
      setCheckoutStatus("success");
    } else if (checkoutCanceled) {
      setCheckoutStatus("canceled");
    }
  }, [searchParams]);
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-start">
      <div className="container flex flex-col items-center justify-start gap-12 px-4 py-16 ">
        {checkoutStatus !== "sucesss" && (
          <div className="flex flex-col items-center justify-center gap-8 text-xl">
            <h1 className="text-xl font-light">skydiary {t("title")}</h1>
            <div className="flex w-full flex-row items-center justify-center gap-4">
              <Button
                id="monthly"
                isSpecial={!isYearly}
                onClick={() => setIsYearly(false)}
                variant="cta"
              >
                <span className="text-sm">monthly</span>
              </Button>

              <Button
                id="yearly"
                isSpecial={isYearly}
                onClick={() => setIsYearly(true)}
                variant="cta"
              >
                <span className="text-sm">yearly: </span>
                <span className="text-xs font-light">get 2 months free</span>
              </Button>
            </div>
            <Card isButton={true} variant="form">
              <div className="flex w-full flex-col items-center gap-4 pb-4">
                <ul className="flex flex-col gap-4 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircledIcon className="h-5 w-5" /> add unlimited
                    custom personas
                  </li>
                  <li className="flex gap-2">
                    <CheckCircledIcon className="h-5 w-5" /> get up to 10
                    comments per day
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircledIcon className="h-5 w-5" /> get comments with
                    1000+ words
                  </li>

                  <li className="flex items-start gap-2">
                    <CheckCircledIcon className="h-5 w-5" />
                    get early access to new features
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircledIcon className="h-5 w-5" /> add long-term
                    memory to all personas
                  </li>
                </ul>
              </div>

              <form
                onSubmit={async () => {
                  try {
                    setIsLoading(true);
                    let period: "monthly" | "yearly" | undefined;
                    if (!isYearly) {
                      period = "monthly";
                    } else {
                      period = "yearly";
                    }
                    if (!period) {
                      console.error("Payment period is not defined");
                      throw new Error("Payment period is not defined");
                    }

                    const { checkoutUrl } = await createCheckoutSession({
                      period,
                    });

                    if (checkoutUrl) {
                      void router.push(checkoutUrl);
                    }
                  } catch (error) {
                    console.error(error);
                  }
                  setIsLoading(false);
                }}
              >
                <div className="flex w-full flex-row items-end justify-center gap-2 pb-2">
                  <span className="text-3xl font-medium">
                    {isYearly ? "$50" : "$5"}
                  </span>
                  <span className="pb-1 text-sm font-light">
                    {isYearly ? "per year" : "per month"}
                  </span>
                </div>

                <div className="flex w-full flex-col gap-4 sm:flex-row">
                  <FormButton
                    variant="submit"
                    isSpecial={true}
                    isDisabled={isLoading}
                  >
                    <div className="flex items-center gap-2">
                      {!isLoading ? (
                        <>
                          subscribe
                          <ArrowRightIcon className="h-3 w-3 animate-ping" />
                        </>
                      ) : (
                        <>
                          <ButtonSpinner /> checking out...
                        </>
                      )}
                    </div>
                  </FormButton>
                </div>
              </form>
            </Card>
          </div>
        )}
        {checkoutStatus === "success" && (
          <div className="flex w-80 flex-col items-center justify-center gap-8 text-xl">
            <h2 className="text-xl font-light">
              thank you for activating skydiary
            </h2>
            <Card variant="form">
              <p className="font-light">you now have access to all features:</p>
              <ul className="ml-4 list-disc font-light">
                <li>make unlimited custom personas</li>
                <li>get unlimited comments</li>
                <li>get longer comments</li>
                <li>give personas long-term memory</li>
              </ul>
              <Link href="/today">
                <Button variant="primary">{`try it on today's entry`}</Button>
              </Link>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
