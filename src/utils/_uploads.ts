"use server";

import { UTApi } from "uploadthing/server";
import { getServerAuthSession } from "~/server/auth";

const utapi = new UTApi();

/**
 * @see https://docs.uploadthing.com/api-reference/server#uploadfiles
 */
export async function uploadFile(file: File) {
  const session = await getServerAuthSession();
  if (!session) throw new Error("No session for file upload");
  const uploadedFiles = await utapi.uploadFiles([file]);
  return uploadedFiles;
}

/**
 * @see https://docs.uploadthing.com/api-reference/server#uploadfilesfromurl
 */
export async function uploadFromUrl(url: string) {
  const session = await getServerAuthSession();
  if (!session) throw new Error("No session for file upload");
  const uploadedFile = await utapi.uploadFilesFromUrl(url);
  return uploadedFile.data;
}

export async function getNewImageUrl({
  imageFile,
  imageUrl,
}: {
  imageFile?: File;
  imageUrl?: string;
}) {
  "use server";

  const validExtensions = [".png", ".jpeg", ".jpg", ".svg", ".webp"];
  let image = "";

  if (imageFile) {
    if (imageFile.size === 0 || imageFile.name === "undefined")
      return undefined;
    const fileExtension = imageFile.name
      .slice(imageFile.name.lastIndexOf("."))
      .toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      throw new Error(
        "Invalid file type. Only .png, .jpeg, .jpg, .svg, and .webp are allowed.",
      );
    }
    const uploadedFiles = await uploadFile(imageFile);
    if (uploadedFiles.length > 0) {
      image = uploadedFiles[0]?.data?.url ?? "";
    }
  } else if (imageUrl) {
    const urlExtension = imageUrl
      .slice(imageUrl.lastIndexOf("."))
      .toLowerCase();
    if (!validExtensions.includes(urlExtension)) {
      throw new Error(
        "Invalid file type. Only .png, .jpeg, .jpg, .svg, and .webp are allowed.",
      );
    }
    const uploadedFile = await uploadFromUrl(imageUrl);
    if (uploadedFile) {
      image = uploadedFile.url ?? "";
    }
  }

  return image;
}
