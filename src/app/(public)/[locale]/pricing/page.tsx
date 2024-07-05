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
  const SUCCESS = "success";

  const [checkoutStatus, setCheckoutStatus] = useState("");
  const [isYearly, setIsYearly] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkoutSuccess = searchParams.get("checkoutSuccess");
    const checkoutCanceled = searchParams.get("checkoutCanceled");

    if (checkoutSuccess) {
      setCheckoutStatus(SUCCESS);
    } else if (checkoutCanceled) {
      setCheckoutStatus("");
    }
  }, [searchParams]);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-start">
      <div className="container flex flex-col items-center justify-start gap-12 px-4 py-16 ">
        <h1 className="text-xl">{t("title")}</h1>
        {checkoutStatus === SUCCESS && (
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-4xl">{t("welcome")}</h2>
            <p className="text-4xl">{t("thankYou")}</p>
            <p>{t("emailWithDetails")}</p>
          </div>
        )}
        {checkoutStatus !== SUCCESS && (
          <div className="flex w-full flex-col items-center justify-center gap-8">
            <div className="flex w-full flex-row items-center justify-center gap-4">
              <Button
                id="monthly"
                isSpecial={!isYearly}
                onClick={() => setIsYearly(false)}
                variant="cta"
              >
                <span className="text-sm">🌜 {t("monthly")}</span>
              </Button>

              <Button
                id="yearly"
                isSpecial={isYearly}
                onClick={() => setIsYearly(true)}
                variant="cta"
              >
                <div className="flex flex-row items-center text-sm">
                  <span className="pr-1">
                    <span className="text-base">🌞</span> {t("yearly")}:
                  </span>
                  <span>{t("yearlyPriceDetail0")}</span>
                </div>
              </Button>
            </div>
            <div className="flex w-full flex-row items-start justify-center gap-8">
              <div className="flex w-80 flex-col items-center justify-center gap-8 text-xl">
                <Card isButton={false}>
                  <div className="flex flex-col items-start gap-8 pb-4 text-xl">
                    <h2 className="text-lg">{t("lite.title")}</h2>
                    {!isSession && (
                      <p className="text-base font-bold">
                        {t("createAccountToStart")}
                      </p>
                    )}
                    <ul className="flex flex-col gap-4 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircledIcon className="h-5 w-5" />
                        {t("lite.entries")}
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircledIcon className="h-5 w-5" />
                        {t("lite.personas")}
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircledIcon className="h-5 w-5" />{" "}
                        {t("lite.comments")}
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircledIcon className="h-5 w-5" />
                        {t("lite.commentLength")}
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircledIcon className="h-5 w-5" />{" "}
                        {t("lite.featureAccess")}
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircledIcon className="h-5 w-5" />{" "}
                        {t("lite.memory")}
                      </li>
                    </ul>
                    {!isSession && (
                      <div className="flex w-full flex-col items-center justify-center gap-2">
                        <Link href="/auth/signin">
                          <Button variant="submit" isSpecial={true}>
                            {t("signIn")}
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
              <div className="flex w-80 flex-col items-center justify-center gap-8 text-xl">
                <Card variant="form">
                  <div className="flex w-full flex-col items-start gap-8 pb-4">
                    <h2 className="text-lg">{t("premium.title")}</h2>
                    <form
                      className="w-full"
                      onSubmit={async (event) => {
                        event.preventDefault();
                        try {
                          setIsLoading(true);
                          if (!isSession) {
                            return;
                          }
                          const period = isYearly ? "yearly" : "monthly";

                          const { checkoutUrl } = await createCheckoutSession({
                            period,
                          });

                          if (checkoutUrl) {
                            void router.push(checkoutUrl);
                          }
                        } catch (error) {
                          console.error(
                            "submit checkout session error:",
                            error,
                          );
                        }
                        setIsLoading(false);
                      }}
                    >
                      <div className="flex w-full flex-row items-end justify-start gap-2 pb-2">
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
                        {isSession && (
                          <>
                            <FormButton
                              variant="submit"
                              isSpecial={true}
                              isDisabled={isLoading}
                            >
                              <div className="flex items-center gap-2 text-lg font-light">
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
                        )}
                      </div>
                    </form>
                    <ul className="flex flex-col gap-4 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircledIcon className="h-5 w-5" />
                        {t("premium.entries")}
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircledIcon className="h-5 w-5" />{" "}
                        {t("premium.personas")}
                      </li>
                      <li className="flex gap-2">
                        <CheckCircledIcon className="h-5 w-5" />{" "}
                        {t("premium.comments")}
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircledIcon className="h-5 w-5" />{" "}
                        {t("premium.commentLength")}
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircledIcon className="h-5 w-5" />
                        {t("premium.featureAccess")}
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircledIcon className="h-5 w-5" />{" "}
                        {t("premium.memory")}
                      </li>
                    </ul>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
        {checkoutStatus === SUCCESS && (
          <div className="flex w-80 flex-col items-center justify-center gap-8">
            <Card variant="form">
              <p className="font-light">{t("thankYouDetails")}</p>
              <ul className="flex flex-col gap-4 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircledIcon className="h-5 w-5" />
                  {t("premium.entries")}
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircledIcon className="h-5 w-5" />{" "}
                  {t("premium.personas")}
                </li>
                <li className="flex gap-2">
                  <CheckCircledIcon className="h-5 w-5" />{" "}
                  {t("premium.comments")}
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircledIcon className="h-5 w-5" />{" "}
                  {t("premium.commentLength")}
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircledIcon className="h-5 w-5" />
                  {t("premium.featureAccess")}
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircledIcon className="h-5 w-5" /> {t("premium.memory")}
                </li>
              </ul>
              <Link href="/today">
                <Button variant="submit" isSpecial={true}>
                  {t("tryItNow")}
                </Button>
              </Link>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
