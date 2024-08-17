"use server";
import { revalidatePath } from "next/cache";

const clearCacheAndFetch = async (path: string) => {
  try {
    if (path !== "/settings") {
      revalidatePath("/");
    } else {
      console.log("revalidating and redirecting");
      revalidatePath("/settings", "layout");
    }
  } catch (error) {
    console.error("clearCacheAndFetch=> ", error);
  }
};

export default clearCacheAndFetch;
