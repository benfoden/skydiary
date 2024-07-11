import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import SignInForm from "./SignInForm";
import VerificationAlert from "./VerificationAlert";

export default async function SignIn() {
  const session = await getServerAuthSession();
  if (session) return redirect("/home");

  const signUpEmail = cookies().get("signupEmail")?.value ?? "";

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      <div className="z-20 flex h-dvh w-full items-center justify-center">
        <div className="flex w-full flex-col items-center justify-center px-2 text-xl sm:w-96 sm:px-0">
          <h1 className="mb-8 text-xl font-light">skydiary</h1>
          <VerificationAlert />
          <SignInForm signUpEmail={signUpEmail} />
        </div>
      </div>
    </div>
  );
}
