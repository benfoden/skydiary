import Image from "next/image";

export function Avatar({
  src,
  alt,
  size = "small",
}: {
  src: string;
  alt: string;
  size?: "small" | "medium" | "large";
}) {
  if (size === "small") {
    return (
      <div className="relative h-4 w-4 overflow-hidden rounded-full">
        <Image
          src={src}
          alt={alt}
          height={32}
          width={32}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }
  if (size === "medium") {
    return (
      <div className="relative h-8 w-8 overflow-hidden rounded-full">
        <Image
          src={src}
          alt={alt}
          height={64}
          width={64}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }
  if (size === "large") {
    return (
      <div className="relative h-24 w-24 overflow-hidden rounded-full">
        <Image
          src={src}
          alt={alt}
          height={192}
          width={192}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }
}
