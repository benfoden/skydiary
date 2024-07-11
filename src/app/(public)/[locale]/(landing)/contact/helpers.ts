"use server";
import { cookies } from "next/headers";

export async function deleteContactEmailCookie() {
  console.log("deleting contact email cookie");
  cookies().delete("contactEmail");
}
