import { redirect } from "next/navigation";
import { type Locale } from "~/config";
import { api } from "~/trpc/server";
import FormButton from "./FormButton";

export default function ManageBillingButton({ locale }: { locale: Locale }) {
  return (
    <form
      action={async () => {
        "use server";
        const { billingPortalUrl }: { billingPortalUrl: string } =
          await api.stripe.createBillingPortalSession({
            locale,
          });
        void redirect(billingPortalUrl);
      }}
    >
      <FormButton>update your billing details</FormButton>
    </form>
  );
}
