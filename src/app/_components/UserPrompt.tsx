"use client";
import { type Prompt } from "@prisma/client";
import { CaretRightIcon, Cross2Icon } from "@radix-ui/react-icons";
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
    isPromptShown &&
    activeIndex > -1 && (
      <div className="flex w-full max-w-5xl flex-col items-center justify-center gap-4 pb-4">
        <div className="flex w-full flex-row items-center justify-start gap-4 py-4">
          {prompts?.map((prompt, i) => (
            <div
              key={prompt.id}
              className={`flex w-fit flex-row items-center justify-between gap-2 rounded-full px-3 py-1 ${i === activeIndex + 1 && "bg-gradient-to-r from-white/30 to-transparent dark:from-white/10"} ${i < activeIndex && "hidden"} ${i === activeIndex && "bg-white/30 dark:bg-white/10"}`}
            >
              <p
                className={`${i === activeIndex + 1 && "bg-gradient-to-r from-white to-transparent bg-clip-text text-transparent"} text-sm font-light`}
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
          <Button variant="chip" onClick={() => setActiveIndex(-1)}>
            <Cross2Icon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  );
}
