import { getTranslations } from "next-intl/server";
import DropDownUser from "~/app/_components/DropDownUser";
import { NavChevronLeft } from "~/app/_components/NavChevronLeft";
import { SessionNav } from "~/app/_components/SessionNav";
import { getServerAuthSession } from "~/server/auth";
import { PublicNav } from "../(landing)/PublicNav";
import UpgradeBody from "./page";

export default async function Upgrade() {
  const t = await getTranslations();
  const session = await getServerAuthSession();
  return (
    <>
      {session ? (
        <SessionNav>
          <div className="flex items-center gap-2">
            <NavChevronLeft targetPathname={"/home"} label={t("nav.home")} />
          </div>

          <DropDownUser />
        </SessionNav>
      ) : (
        <PublicNav />
      )}

      <UpgradeBody isSession={!!session} />
    </>
  );
}
