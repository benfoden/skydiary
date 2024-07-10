"use client";
import { useEffect, useState } from "react";

export default function HeroStringSwapper({ strings }: { strings: string[] }) {
  const [currentStringIndex, setCurrentStringIndex] = useState(0);
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const stringInterval = setInterval(() => {
      setCurrentStringIndex((prevIndex) => (prevIndex + 1) % strings.length);
      setDotCount(0); // Reset dot count to 1 when the string changes
    }, 3000);

    const dotInterval = setInterval(() => {
      setDotCount((prevCount) => (prevCount + 1) % 4); // Allow dotCount to go from 0 to 3
    }, 1000);

    return () => {
      clearInterval(stringInterval);
      clearInterval(dotInterval);
    };
  }, [strings.length]);

  return `${strings[currentStringIndex]}${".".repeat(dotCount)}`;
}
