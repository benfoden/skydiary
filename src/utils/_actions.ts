"use server";

import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

/**
 * @see https://docs.uploadthing.com/api-reference/server#uploadfiles
 */
export async function uploadFile(file: File) {
  const uploadedFiles = await utapi.uploadFiles([file]);
  return uploadedFiles;
}

/**
 * @see https://docs.uploadthing.com/api-reference/server#uploadfilesfromurl
 */
export async function uploadFromUrl(fd: FormData) {
  const url = fd.get("url") as string;
  const uploadedFile = await utapi.uploadFilesFromUrl(url);
  return uploadedFile.data;
}
