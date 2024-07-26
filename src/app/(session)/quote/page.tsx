"use client";
import { useState } from "react";
import { Card } from "~/app/_components/Card";
import Input from "~/app/_components/Input";
import StarsBackground from "~/app/_components/StarsBackground";
export default function QuotePage() {
  const [quote, setQuote] = useState<string>("");
  const [author, setAuthor] = useState<string>("");

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-16">
      <StarsBackground hidden={false} />
      <div className="flex w-full flex-col items-center justify-center gap-4">
        <Card variant="hero" isButton={false}>
          <div className="p-4 text-center">
            <div className="flex flex-col items-center justify-center gap-2 text-3xl font-light">
              <span>" {quote} "</span>
              <span className="text-2xl font-bold">{author}</span>
            </div>
            <div className="flex flex-row items-center justify-end gap-2">
              <p className="text-base opacity-60">
                <span>skydiary.app</span>
              </p>
            </div>
          </div>
        </Card>
        <div className="flex w-32 flex-col items-center justify-center gap-4">
          <Input
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            label="quote"
          />
          <Input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            label="author"
          />
        </div>
      </div>
    </div>
  );
}
