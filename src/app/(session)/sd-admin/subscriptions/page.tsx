import { api } from "~/trpc/server";

export default async function Secret() {
  const subscriptions = await api.stripe.getAllSubs();

  return (
    <>
      <div>subscriptions</div>
      <div>{JSON.stringify(subscriptions, null, 2)}</div>
    </>
  );
}
