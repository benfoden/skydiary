import {
  CaretUpIcon,
  EnvelopeClosedIcon,
  ExitIcon,
  GearIcon,
  IdCardIcon,
  LockClosedIcon,
  PersonIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import { ACTIVESTATUSES, planFromId } from "~/utils/constants";
import Button from "./Button";
import DropDownMenu from "./DropDown";
import { ThemeToggle } from "./ToggleTheme";

export default async function DropDownUser() {
  const session = await getServerAuthSession();
  const t = await getTranslations();

  return (
    <DropDownMenu isUserMenu userProfileIconUrl={session?.user?.image ?? ""}>
      {session?.user.isAdmin &&
        session?.user.email === "ben.foden@gmail.com" && (
          <Link href={"/sd-admin"}>
            <Button variant="menuElement">
              webmaster <LockClosedIcon className="h-4 w-4" />
            </Button>
          </Link>
        )}
      {session?.user?.stripeSubscriptionStatus &&
        ACTIVESTATUSES.includes(session?.user?.stripeSubscriptionStatus) && (
          <Link href={"/pricing"}>
            <Button variant="menuElement">
              <span className="text-blue-600 dark:text-blue-400">
                skydiary{" "}
                {planFromId(session?.user?.stripeProductId) === "plus" &&
                  t("nav.plus")}
                {planFromId(session?.user?.stripeProductId) === "premium" &&
                  t("nav.premium")}
              </span>
            </Button>
          </Link>
        )}{" "}
      {(!session?.user?.stripeSubscriptionStatus ||
        !ACTIVESTATUSES.includes(session?.user?.stripeSubscriptionStatus)) &&
        !session?.user?.isSpecial && (
          <Link href={"/pricing"}>
            <Button variant="menuElement" isSpecial>
              {t("nav.upgrade")} <PlusIcon className="h-4 w-4" />
            </Button>
          </Link>
        )}
      {session?.user?.isSpecial && (
        <Link href={"/pricing"}>
          <Button variant="menuElement" isSpecial>
            special status: on
          </Button>
        </Link>
      )}
      <ThemeToggle isMenuButton />
      <Link href={"/persona/all"}>
        <Button variant="menuElement">
          {t("nav.personas")} <PersonIcon className="h-4 w-4" />
        </Button>
      </Link>
      <Link href={"/prompt"}>
        <Button variant="menuElement">
          {t("nav.prompts")} <div className="mr-1">?</div>
        </Button>
      </Link>
      <Link href={"/settings"}>
        <Button variant="menuElement">
          {t("nav.settings")} <GearIcon className="h-4 w-4" />
        </Button>
      </Link>
      <Link href={"/contact"}>
        <Button type="submit" variant="menuElement">
          {t("nav.contact")} <EnvelopeClosedIcon className="h-4 w-4" />
        </Button>
      </Link>
      <Link href={"/blog"}>
        <Button type="submit" variant="menuElement">
          {t("nav.blog")} <IdCardIcon className="h-4 w-4" />
        </Button>
      </Link>
      <Link href={"/"}>
        <Button type="submit" variant="menuElement">
          {t("nav.topPage")} <CaretUpIcon className="h-4 w-4" />
        </Button>
      </Link>
      <Link href={"/auth/signout"}>
        <Button variant="menuElement">
          {t("nav.signout")}
          <ExitIcon className="h-4 w-4" />
        </Button>
      </Link>
    </DropDownMenu>
  );
}
