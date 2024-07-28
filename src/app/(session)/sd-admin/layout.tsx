import Link from "next/link";
import { redirect } from "next/navigation";
import Button from "~/app/_components/Button";
import DropDownMenu from "~/app/_components/DropDown";
import DropDownUser from "~/app/_components/DropDownUser";
import { NavChevronLeft } from "~/app/_components/NavChevronLeft";
import { SessionNav } from "~/app/_components/SessionNav";
import { getServerAuthSession } from "~/server/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  if (session?.user.email !== "ben.foden@gmail.com") redirect("/home");

  return (
    <>
      <SessionNav>
        <div className="flex items-center gap-2">
          <NavChevronLeft targetPathname={"/home"} label={"home"} />
        </div>
        <h1>webmaster zone</h1>

        <DropDownUser />
      </SessionNav>

      <div className="flex min-h-screen w-full flex-col items-center justify-start">
        <div className="container flex flex-col items-end justify-start gap-12 px-2 py-4 md:px-8 md:py-16">
          <div className="hidden flex-row flex-wrap gap-4 md:flex">
            <Link href={"/sd-admin"}>webmaster home</Link>
            <Link href={"/sd-admin/blog"}>blog</Link>
            <Link href={"/sd-admin/image"}>image</Link>
            <Link href={"/sd-admin/event"}>event</Link>
            <Link href={"/sd-admin/user"}>user</Link>
            <Link href={"/sd-admin/tags"}>tags</Link>
            <Link href={"/sd-admin/prompts"}>prompts</Link>
            <Link href={"/sd-admin/sandbox"}>sandbox</Link>
            <Link href={"/sd-admin/subscriptions"}>subs</Link>
            <Link href={"/sd-admin/email"}>email</Link>
            <Link href={"/sd-admin/cron"}>cron</Link>
          </div>
          <DropDownMenu>
            <Link href={"/sd-admin"}>
              <Button variant="menuElement">home</Button>
            </Link>
            <Link href={"/sd-admin/blog"}>
              <Button variant="menuElement">blog</Button>
            </Link>
            <Link href={"/sd-admin/image"}>
              <Button variant="menuElement">image</Button>
            </Link>
            <Link href={"/sd-admin/event"}>
              <Button variant="menuElement">event</Button>
            </Link>
            <Link href={"/sd-admin/user"}>
              <Button variant="menuElement">user</Button>
            </Link>
            <Link href={"/sd-admin/tags"}>
              <Button variant="menuElement">tags</Button>
            </Link>
            <Link href={"/sd-admin/prompts"}>
              <Button variant="menuElement">prompts</Button>
            </Link>
            <Link href={"/sd-admin/sandbox"}>
              <Button variant="menuElement">sandbox</Button>
            </Link>
            <Link href={"/sd-admin/subscriptions"}>
              <Button variant="menuElement">subs</Button>
            </Link>
            <Link href={"/sd-admin/email"}>
              <Button variant="menuElement">email</Button>
            </Link>
            <Link href={"/sd-admin/cron"}>
              <Button variant="menuElement">cron</Button>
            </Link>
          </DropDownMenu>

          {children}
        </div>
      </div>
    </>
  );
}
