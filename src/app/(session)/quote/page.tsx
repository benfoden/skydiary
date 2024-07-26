"use server";
import { getTranslations } from "next-intl/server";
import DropDownUser from "~/app/_components/DropDownUser";
import { NavChevronLeft } from "~/app/_components/NavChevronLeft";
import { SessionNav } from "~/app/_components/SessionNav";
import QuoteClient from "./QuoteClient";
export default async function QuotePage() {
  "use server";
  const t = await getTranslations();

  return (
    <>
      <SessionNav>
        <NavChevronLeft targetPathname={"/topics"} label={t("nav.topics")} />
        <h1>{t("nav.home")}</h1>
        <DropDownUser />
      </SessionNav>

      <div className="flex flex-col items-center justify-center gap-4 px-4 py-16">
        <QuoteClient />
      </div>
    </>
  );
}
