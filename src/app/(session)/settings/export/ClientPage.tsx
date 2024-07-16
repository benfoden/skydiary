"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Button from "~/app/_components/Button";

export default function ClientPage({
  json,
  error,
  isLoading,
}: {
  json: string;
  error: string | null;
  isLoading: boolean;
}) {
  const t = useTranslations();
  const blob = new Blob([json], { type: "application/json" });

  if (typeof window !== "undefined") {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `skydiary_export_data-${new Date().toISOString()}.json`,
    );
    document.body.appendChild(link);
    link.click();
  }

  return (
    <div className="flex flex-col items-start justify-center gap-4">
      {isLoading ? (
        <p>{t("settings.preparingExport")}</p>
      ) : (
        <p>{t("settings.checkDownloadsFolder")}</p>
      )}
      {error && <p className="text-red-500">{error}</p>}
      <Link href="/settings">
        <Button>{t("settings.backToSettings")}</Button>
      </Link>
    </div>
  );
}
