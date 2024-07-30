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
    <div className="flex h-full w-full flex-col items-center justify-center px-2 text-xl sm:w-96">
      <VerificationAlert />
      <SignInForm signUpEmail={signUpEmail} />
    </div>
  );
}
