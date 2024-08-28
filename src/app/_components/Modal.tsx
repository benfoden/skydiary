"use client";
import { Card } from "~/app/_components/Card";

export default function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-10 flex h-full w-full items-center justify-center">
      <div className="absolute inset-0 h-full w-full bg-black/60 backdrop-blur-xl"></div>
      <div className="relative my-16 flex max-h-full w-full flex-col items-start overflow-y-auto p-2 md:w-fit md:p-0">
        <Card isButton={false} variant="form">
          {children}
        </Card>
      </div>
    </div>
  );
}
