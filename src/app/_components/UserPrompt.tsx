"use client";
import { type Prompt } from "@prisma/client";
import { useState } from "react";

export default function UserPrompt({ prompts }: { prompts: Prompt[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      {prompts?.map((prompt) => (
        <div key={prompt.id}>
          <div className="flex w-full flex-row items-center justify-between gap-4">
            <div className="flex w-full flex-row items-center gap-2">
              {prompt.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
