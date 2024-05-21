import { redirect } from "next/navigation";
import React from "react";
import Spinner from "~/app/_components/Spinner";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

/**
 * This page is where new users logging in for the first time are
 * redirected to, by Next Auth. Here we will just create two welcome
 * notifications and redirect them back on their way.
 */
const NewUserPage: React.FC = async () => {
  const session = await getServerAuthSession();

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      <div className="z-20 flex h-dvh w-full items-center justify-center">
        <div className="flex w-80 flex-col items-center justify-center text-xl">
          <h2 className="flex items-center font-light text-[#424245]">
            <span className="text-xl font-light text-[#424245]">
              welcome to skydiary
            </span>
          </h2>
          {!session ? (
            <div className="m-8 flex w-full flex-col gap-2 rounded-lg bg-white/50 p-6 shadow-lg">
              <Spinner />
              Loading...
            </div>
          ) : (
            <div className="m-8 flex w-full flex-col gap-2 rounded-lg bg-white/50 p-6 shadow-lg">
              <form
                className="[&>div]:last-of-type:hidden"
                action={async (formData) => {
                  "use server";
                  const name: string = formData.get("name") as string;

                  if (name) {
                    try {
                      await api.user.updateUser({ name });
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
                <button
                  type="submit"
                  className="mt-2 flex h-12 w-full items-center justify-center space-x-2 rounded bg-white/70 px-4 text-base font-light transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:ring-offset-2"
                >
                  save and continue
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewUserPage;