"use client";
import { type Prompt } from "@prisma/client";
import { CaretRightIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import Button from "./Button";

export default function UserPrompt({
  prompts,
  isPromptShown,
}: {
  prompts: Prompt[];
  isPromptShown: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    isPromptShown && (
      <div className="ml-4 mr-2 flex w-full flex-col items-center justify-center gap-4 pl-1 md:ml-12 md:mr-0">
        <div className="flex w-full flex-row items-center justify-between gap-4 py-4">
          {prompts?.map((prompt, i) => (
            <div
              key={prompt.id}
              className={`${i < activeIndex || i > activeIndex + 1 ? "hidden" : "flex w-full flex-row items-center justify-between gap-2 rounded-full px-3 py-1"} ${i === activeIndex + 1 ? "hidden md:flex" : ""}`}
            >
              <p
                className={`${i === activeIndex + 1 ? "hidden w-full bg-gradient-to-r from-white to-transparent bg-clip-text text-transparent md:flex" : ""} text-sm font-light opacity-70`}
              >
                {i === activeIndex && prompt.content}
                {i === activeIndex + 1 && prompt.content.slice(0, 10)}
              </p>
            </div>
          ))}
          <Button
            variant="chip"
            onClick={() =>
              setActiveIndex(
                activeIndex < prompts.length - 1 ? activeIndex + 1 : 0,
              )
            }
          >
            <CaretRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  );
}
