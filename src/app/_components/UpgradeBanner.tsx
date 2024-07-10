"use client";
import {
  Cross1Icon,
  Cross2Icon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import Button from "~/app/_components/Button";
import { Card } from "~/app/_components/Card";

export default function UpgradeBanner({
  variant,
}: {
  variant?: "comment" | "persona";
}) {
  const t = useTranslations();

  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div
      onClick={() => !isOpen && toggleOpen()}
      className={`pt-2 ${!isOpen ? "cursor-pointer" : "cursor-default"}`}
      role="button"
      aria-expanded={isOpen}
      aria-label={isOpen ? "Collapse upgrade banner" : "Expand upgrade banner"}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          !isOpen && toggleOpen();
        }
      }}
    >
      <Card isButton={!isOpen}>
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <div className="flex w-full flex-row items-center justify-between gap-2">
            <div className="opacity-0">
              <Button variant="text">
                <Cross2Icon className="h-4 w-4" />
              </Button>
            </div>
            <h2 className={`${isOpen ? "text-2xl" : "text-sm"} font-bold`}>
              {variant === "persona" && t("personas.limitTitle")}
              {variant === "comment" && t("entry.limitTitle")}
              {!isOpen && " ?"}
            </h2>
            {isOpen ? (
              <Button variant="text" onClick={toggleOpen}>
                <Cross1Icon className="h-5 w-5" />
              </Button>
            ) : (
              <div className="opacity-0">
                <Button variant="text" onClick={toggleOpen}>
                  <DotsHorizontalIcon className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
          {isOpen && (
            <>
              <p className=" text-sm font-bold">
                {variant === "persona" && t("personas.limitDescription1")}
                {variant === "comment" && t("entry.limitDescription1")}
              </p>
              <p className="text-sm font-light">
                {variant === "persona" && t("personas.limitDescription2")}
                {variant === "comment" && t("entry.limitDescription2")}
              </p>
              <Link href="/pricing">
                <Button variant="cta" isSpecial>
                  {t("nav.upgrade")}
                </Button>
              </Link>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
