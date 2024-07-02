"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "~/app/_components/Button";
import { Card } from "~/app/_components/Card";
import { api } from "~/trpc/react";

export default function Upgrade() {
  const { mutateAsync: createCheckoutSession } =
    api.stripe.createCheckoutSession.useMutation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [checkoutStatus, setCheckoutStatus] = useState("");

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
    <div className="relative flex h-full w-full overflow-hidden">
      <div className="z-20 flex h-dvh w-full items-center justify-center">
        {checkoutStatus === "success" && (
          <div className="flex w-80 flex-col items-center justify-center text-xl">
            <h2 className="mb-8 text-xl font-light">
              thank you for upgrading.
            </h2>
            <p>you can now access all features of skydiary.</p>
          </div>
        )}
        {checkoutStatus !== "sucesss" && (
          <div className="flex flex-col items-center justify-center gap-8 text-xl">
            <h1 className="text-xl font-light">activate your skydiary</h1>
            <Card variant="form">
              <div className="flex w-full flex-col items-center gap-4 pb-4">
                <ul className="ml-4 list-disc font-light">
                  <li>make unlimited custom personas</li>
                  <li>get unlimited comments</li>
                  <li>get longer comments</li>
                  <li>give personas long-term memory</li>
                </ul>
              </div>

              <form
                onSubmit={async (event) => {
                  event.preventDefault(); // Prevent the default form submission

                  console.log(event.target);
                  try {
                    let period: "monthly" | "yearly" | undefined;
                    const target = event.nativeEvent as SubmitEvent;
                    const submitter = target.submitter as HTMLButtonElement;
                    if (submitter?.id === "monthly") {
                      period = "monthly";
                    } else if (submitter?.id === "yearly") {
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
                }}
              >
                <div className="flex w-full flex-col gap-4 sm:flex-row">
                  <Button type="submit" id="monthly">
                    $5 / month
                  </Button>

                  <Button type="submit" id="yearly">
                    $50 / year
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
