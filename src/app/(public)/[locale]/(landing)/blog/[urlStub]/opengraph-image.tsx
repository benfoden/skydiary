import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "skydiary blog";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const interExtraLight = fetch(new URL("/Inter-ExtraLight.ttf")).then((res) =>
    res.arrayBuffer(),
  );

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 96,
          background: "linear-gradient(to bottom, #cce3f1, #f3f6f6)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        skydiary blog
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: await interExtraLight,
          style: "normal",
          weight: 200,
        },
      ],
    },
  );
}
