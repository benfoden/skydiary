"use client";
import html2canvas from "html2canvas";
import { useRef, useState } from "react";
import Button from "~/app/_components/Button";
import { Card } from "~/app/_components/Card";
import Input from "~/app/_components/Input";
import StarsBackground from "~/app/_components/StarsBackground";

export default function QuoteClient() {
  const [quote, setQuote] = useState<string>("");
  const [quoteLine2, setQuoteLine2] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [hasQuoteMarks, setHasQuoteMarks] = useState<boolean>(false);
  const printRef = useRef<HTMLElement | null>(null);

  const handleDownloadImage = async () => {
    const element = printRef.current;
    if (!element) return; // Ensure element is not null
    const canvas = await html2canvas(element);

    const data = canvas.toDataURL("image/jpg");
    const link = document.createElement("a");

    if (typeof link.download === "string") {
      link.href = data;
      link.download = `skydiary-quote-${new Date().toISOString()}.png`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(data);
    }
  };
  return (
    <>
      <StarsBackground hidden={false} />
      <div className="flex w-full flex-row items-start justify-start gap-32 ">
        <Card variant="narrow" isButton={false}>
          <div className="flex max-w-56 flex-col items-center justify-center gap-4 px-2 py-4">
            <Input
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              label="quote"
            />
            <Input
              value={quoteLine2}
              onChange={(e) => setQuoteLine2(e.target.value)}
              label="quote line 2"
            />
            <Input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              label="author"
            />

            <Button onClick={() => setHasQuoteMarks(!hasQuoteMarks)}>
              {hasQuoteMarks ? "Remove Quote Marks" : "Add Quote Marks"}
            </Button>
            <Button onClick={handleDownloadImage}>Download Image</Button>
          </div>
        </Card>
        <div
          ref={printRef as React.RefObject<HTMLDivElement>}
          className="relative flex h-[1500px] w-[1000px] flex-col items-center justify-center p-16"
        >
          <div className="w-fit">
            <Card isButton={false}>
              <div className="p-12 text-center">
                <div className="flex flex-col items-center justify-center gap-8 text-6xl font-light tracking-widest">
                  {!quoteLine2 ? (
                    <div>
                      {hasQuoteMarks ? '"' : ""}
                      {quote}
                      {hasQuoteMarks ? '"' : ""}
                    </div>
                  ) : (
                    <div>
                      <div>
                        {hasQuoteMarks ? '"' : ""}
                        {quote}
                      </div>
                      <br />
                      {quoteLine2}
                      {hasQuoteMarks ? '"' : ""}
                    </div>
                  )}
                  {author && (
                    <span className="text-2xl font-bold">{author}</span>
                  )}
                </div>
              </div>
            </Card>
          </div>
          <p className="absolute bottom-28 right-48 text-4xl font-light opacity-40">
            <span>skydiary.app</span>
          </p>
        </div>
      </div>
    </>
  );
}
