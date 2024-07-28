import { ImageResponse } from "next/og";
import { api } from "~/trpc/server";

export const runtime = "edge";

export const alt = "skydiary blog";
export const size = {
  width: 1200,
  height: 675,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { urlStub: string };
}) {
  const post = await api.blogPost.getByUrlStub({ urlStub: params.urlStub });

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: "linear-gradient(to bottom, #cce3f1, #f3f6f6)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {post?.title ?? "skydiary blog"}
      </div>
    ),
    {
      ...size,
    },
  );
}
