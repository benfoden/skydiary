import { api } from "~/trpc/server";

import EventBody from "./EventBody";

export default async function Page() {
  const events = await api.event.getAll();
  const users = await api.user.getAllUsersAsAdmin();

  return <EventBody events={events} userCount={users?.length ?? 0} />;
}
