"use client";
import { useRouter } from "next/router";
import { api } from "~/trpc/server";

export default function ManageBillingButton({ locale }: { locale: string }) {
  const createBillingPortalSession =
    api.stripe.createBillingPortalSession.useMutation();
  const { push } = useRouter();

  return (
    <button
      className="w-fit cursor-pointer rounded-md bg-blue-500 px-5 py-2 text-lg font-semibold text-white shadow-sm duration-150 hover:bg-blue-600"
      onClick={async () => {
        const { billingPortalUrl } =
          await createBillingPortalSession.mutateAsync({
            locale,
          });
        if (billingPortalUrl) {
          void push(billingPortalUrl as string);
        }
      }}
    >
      Manage subscription and billing
    </button>
  );
}
