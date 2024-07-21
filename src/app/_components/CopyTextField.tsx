"use client";

import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Button from "./Button";

export default function CopyTextField({ value }: { value: string }) {
  const t = useTranslations();

  const [copied, setCopied] = useState(false);

  return (
    <div className="flex w-full flex-row items-start gap-2">
      <input
        type="text"
        value={value}
        readOnly
        className="w-full rounded-md bg-gray-500/10 p-2 text-center font-mono text-lg dark:bg-gray-500/10"
      />
      <Button
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        }}
      >
        {copied ? (
          <>
            {t("form.copied")} <CheckIcon className="h-4 w-4" />
          </>
        ) : (
          <>
            {t("form.copy")} <CopyIcon className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
