import {
  ExitIcon,
  GearIcon,
  PersonIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import { ACTIVESTATUSES } from "~/utils/constants";
import Button from "./Button";
import DropDownMenu from "./DropDown";
import { ThemeToggle } from "./ToggleTheme";

export default async function DropDownUser() {
  const session = await getServerAuthSession();
  const t = await getTranslations();

  return (
    <DropDownMenu isUserMenu>
      {session?.user?.stripeSubscriptionStatus &&
        ACTIVESTATUSES.includes(session?.user?.stripeSubscriptionStatus) && (
          <Link href={"/pricing"}>
            <Button variant="menuElement">
              <span className="text-blue-600 dark:text-blue-400">
                skydiary {t("nav.plus")}
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
      <Link href={"/settings"}>
        <Button variant="menuElement">
          {t("nav.settings")} <GearIcon className="h-4 w-4" />
        </Button>
      </Link>
      <Link href={"/persona/all"}>
        <Button variant="menuElement">
          {t("nav.personas")} <PersonIcon className="h-4 w-4" />
        </Button>
      </Link>
      {session?.user.email === "ben.foden@gmail.com" && (
        <Link href={"/sd-admin"}>
          <Button variant="menuElement">webmaster zone</Button>
        </Link>
      )}
      <ThemeToggle isMenuButton />
      <Link href={"/auth/signout"}>
        <Button variant="menuElement">
          {t("nav.signout")}
          <ExitIcon className="h-4 w-4" />
        </Button>
      </Link>
    </DropDownMenu>
  );
}
