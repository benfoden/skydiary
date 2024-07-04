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

export default function UpgradeBody({ isSession }: { isSession: boolean }) {
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
            <div className="flex w-full flex-row items-center justify-center gap-4">
              <Button
                id="monthly"
                isSpecial={!isYearly}
                onClick={() => setIsYearly(false)}
                variant="cta"
              >
                <span className="text-sm"> {t("monthly")}</span>
              </Button>

              <Button
                id="yearly"
                isSpecial={isYearly}
                onClick={() => setIsYearly(true)}
                variant="cta"
              >
                <div className="text-sm">
                  <span className="pr-2">🌞 {t("yearly")}:</span>
                  <span>{t("yearlyPriceDetail0")}</span>
                </div>
              </Button>
            </div>
            <Card isButton={true} variant="form">
              <div className="flex w-full flex-col items-center gap-8 pb-2">
                <h1 className="text-xl">{t("title")}</h1>
                <form
                  className="w-full"
                  onSubmit={async () => {
                    try {
                      if (!isSession) {
                        return;
                      }
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
                    <span className="text-5xl font-medium">
                      {isYearly ? t("yearlyPrice") : t("monthlyPrice")}
                    </span>
                    <div className="flex flex-col items-start pb-1">
                      {isYearly && (
                        <div className="flex flex-col text-xs opacity-70">
                          <span>{t("yearlyPriceDetail1")}</span>
                          <span>{t("yearlyPriceDetail2")}</span>
                        </div>
                      )}
                      <span className="mt-[-0.25rem] pt-0 text-base font-medium">
                        {t("perMonth")}
                      </span>
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-4">
                    {isSession ? (
                      <>
                        <FormButton
                          variant="submit"
                          isSpecial={true}
                          isDisabled={isLoading}
                        >
                          <div className="flex items-center gap-2 font-semibold">
                            {!isLoading ? (
                              <>
                                {t("subscribe")}
                                <ArrowRightIcon className="h-3 w-3 animate-ping" />
                              </>
                            ) : (
                              <>
                                <ButtonSpinner /> checking out...
                              </>
                            )}
                          </div>
                        </FormButton>
                      </>
                    ) : (
                      <div className="flex w-full flex-col items-center justify-center gap-8 text-xl">
                        <h2 className="text-sm font-light">
                          log in or sign up to get started
                        </h2>
                        <Link href="/auth/signin">
                          <Button variant="cta">{t("signIn")}</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </form>
                <ul className="flex flex-col gap-4 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircledIcon className="h-5 w-5" /> create unlimited
                    personas
                  </li>
                  <li className="flex gap-2">
                    <CheckCircledIcon className="h-5 w-5" /> get up to 10
                    comments per day
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircledIcon className="h-5 w-5" /> get long comments
                    with 1000+ words
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircledIcon className="h-5 w-5" />
                    early access to new features
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircledIcon className="h-5 w-5" /> long-term memory
                    for all personas
                  </li>
                </ul>
              </div>
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
