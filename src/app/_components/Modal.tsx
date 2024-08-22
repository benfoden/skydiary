"use client";
import { Card } from "~/app/_components/Card";

import { Cross1Icon } from "@radix-ui/react-icons";
import { useState } from "react";

export default function Modal({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  const closeModal = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
      <div className="relative flex w-full flex-col items-center justify-center gap-4 p-8 text-center md:max-w-3xl">
        <button
          onClick={closeModal}
          className="absolute right-4 top-4 m-4 rounded-full p-2 transition-all hover:bg-white/20"
        >
          <Cross1Icon className="h-4 w-4" />
        </button>
        <Card isButton={false}>{children}</Card>
      </div>
    </div>
  );
}
