"use client";
import { Card } from "~/app/_components/Card";

import { Cross1Icon } from "@radix-ui/react-icons";
import { useState } from "react";

export default function Modal({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const closeModal = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 flex h-full w-full items-center justify-center overflow-hidden">
      <div className="absolute inset-0 h-full w-full bg-black/60 backdrop-blur-sm"></div>
      <div className="relative my-16 flex max-h-[768px] w-full flex-col items-start overflow-y-auto md:max-w-3xl">
        <Card isButton={false}>
          <div className="flex w-full flex-row items-center justify-between">
            {title && <h1 className="text-3xl font-light">{title}</h1>}
            <button
              onClick={closeModal}
              className="absolute right-2 top-4 m-2 rounded-full p-2 transition-all hover:bg-white/20"
            >
              <Cross1Icon className="h-6 w-6" />
            </button>
          </div>
          {children}
        </Card>
      </div>
    </div>
  );
}
