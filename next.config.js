/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import("./src/env.js");
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

/** @type {import("next").NextConfig} */
const config = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "Content-Security-Policy",
          value:
            "default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self'; style-src 'self';",
        },
      ],
    },
  ],
};

export default withNextIntl(config);
