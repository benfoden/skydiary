import Link from "next/link";
import { redirect } from "next/navigation";
import Button from "~/app/_components/Button";
import DropDownMenu from "~/app/_components/DropDown";
import { NavChevronLeft } from "~/app/_components/NavChevronLeft";
import { SessionNav } from "~/app/_components/SessionNav";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Settings() {
  const session = await getServerAuthSession();
  if (!session?.user) return null;
  return (
    <>
      <SessionNav>
        <div className="flex items-center gap-2">
          <NavChevronLeft targetPathname={"/home"} label={"home"} />
        </div>
        <h1>settings</h1>

        <DropDownMenu>
          <Link href={"/auth/signout"}>
            <Button variant="menuElement">Sign out {session.user?.name}</Button>
          </Link>
        </DropDownMenu>
      </SessionNav>

      <main className="flex min-h-screen w-full flex-col items-center justify-start">
        <div className="container flex flex-col items-center justify-start gap-12 px-4 py-16 ">
          <div className="flex flex-col items-start justify-center gap-4">
            <form
              className="flex flex-col items-start justify-center gap-4"
              action={async (formData) => {
                "use server";
                const name: string = formData.get("name") as string;
                const email: string = formData.get("email") as string;

                if (name ?? email) {
                  try {
                    await api.user.updateUser({ name, email });
                  } catch (error) {
                    console.error("Error updating user:", error);
                  }
                  redirect("/home");
                }
              }}
            >
              <label className="text-base font-light" htmlFor="name">
                your name
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="block w-full flex-1 rounded-md px-4 py-3 font-normal transition placeholder:font-light placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-zinc-500 sm:text-sm"
                  required
                  placeholder={session.user.name ?? "your name"}
                />
              </label>
              <label className="text-base font-light" htmlFor="email">
                your email
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="block w-full flex-1 rounded-md px-4 py-3 font-normal transition placeholder:font-light placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-zinc-500 sm:text-sm"
                  required
                  placeholder={session.user.email ?? "your email"}
                />
              </label>
              <button
                type="submit"
                className="mt-2 flex h-12 w-full items-center justify-center space-x-2 rounded bg-white/70 px-4 text-base font-light transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:ring-offset-2"
              >
                save and go home
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
