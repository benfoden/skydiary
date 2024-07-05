import { useEffect, useState } from "react";

function generateRandomPixels(pixelCount: number) {
  const pixels = [];
  const pastelColors = ["#AEC6CF", "#C3B1E1", "#B2DFDB"]; // pastel blue, pastel purple, pastel teal

  for (let i = 0; i < pixelCount; i++) {
    const xPadding = Math.random() * 100 + "%";
    const yPadding = Math.random() * 100 + "%";
    const opacity = Math.random();
    const isWhite = Math.random() < 0.7; // 70% chance for white
    const backgroundColor = isWhite
      ? "white"
      : pastelColors[Math.floor(Math.random() * pastelColors.length)];
    const size = i % 117 === 0 ? "3px" : i % 42 === 0 ? "2px" : "1px"; // Set 1 in every 117 pixels to 3px and 1 in every 42 pixels to 2px

    pixels.push(
      <div
        key={i}
        style={{
          position: "absolute",
          width: size,
          height: size,
          backgroundColor: backgroundColor,
          opacity: opacity,
          left: xPadding,
          top: yPadding,
          transform: "rotate(42deg)",
        }}
      />,
    );
  }
  return (
    <div className="fixed inset-0 left-0 top-[-80px] z-[-10] hidden min-h-screen w-full dark:absolute dark:block">
      {pixels}
    </div>
  );
}

export default function StarsBackground({ hidden }: { hidden: boolean }) {
  const [pixelCount, setPixelCount] = useState(500);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setPixelCount(250); // Reduce the number of pixels on small screens
      } else {
        setPixelCount(1000);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial value

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (hidden) {
    return null;
  }
  return <>{generateRandomPixels(pixelCount)}</>;
}
