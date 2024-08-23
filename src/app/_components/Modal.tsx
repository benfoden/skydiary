"use client";
import { Card } from "~/app/_components/Card";

export default function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-10 flex h-full w-full items-center justify-center overflow-hidden">
      <div className="absolute inset-0 h-full w-full bg-black/60 backdrop-blur-sm"></div>
      <div className="relative my-16 flex max-h-[768px] w-full flex-col items-start overflow-y-auto md:max-w-3xl">
        <Card isButton={false}>{children}</Card>
      </div>
    </div>
  );
}
