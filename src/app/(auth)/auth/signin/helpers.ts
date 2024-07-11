"use server";
import { cookies } from "next/headers";

export async function deleteSignUpEmailCookie() {
  cookies().delete("signupEmail");
}
