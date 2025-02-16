import { ImageResponse } from "next/og";
import { getBaseUrl } from "~/utils/clientConstants";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "skydiary";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image() {
  // Font
  const interExtraLight = fetch(
    new URL(`${getBaseUrl()}/Inter-ExtraLight.ttf`, import.meta.url),
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 128,
          background: "linear-gradient(to bottom, #cce3f1, #f3f6f6)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        skydiary
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
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
