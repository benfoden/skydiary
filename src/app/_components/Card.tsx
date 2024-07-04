export const cardColors = (variant?: "default" | "narrow" | "wide" | "form") =>
  ` bg-white/30 dark:bg-white/[.08] ${variant === "form" && "shadow-lg dark:shadow-black/20"}`;
export function Card({
  children,
  isButton = true,
  variant = "default",
}: {
  children: React.ReactNode;
  isButton?: boolean;
  variant?: "default" | "narrow" | "wide" | "form";
}) {
  if (variant === "form") isButton = false;

  const sharedHover =
    "cursor-pointer transition hover:bg-white/60 hover:dark:bg-white/[.16]";

  const DefaultCard = () => (
    <div
      className={
        `w-full min-w-64 rounded-xl px-8 py-2 ${isButton && sharedHover}` +
        cardColors(variant)
      }
    >
      <div className="flex flex-col items-center justify-between gap-2">
        {children}
      </div>
    </div>
  );

  switch (variant) {
    case "default":
      return <DefaultCard />;

    case "narrow":
      return (
        <div
          className={
            `w-64 rounded-xl  px-4 py-2 ${isButton && sharedHover}` +
            cardColors(variant)
          }
        >
          <div className="flex flex-col items-center gap-2">{children}</div>
        </div>
      );
    case "wide":
      return (
        <div
          className={
            `w-full min-w-[512px] rounded-xl px-8 py-2 ${isButton && sharedHover}` +
            cardColors(variant)
          }
        >
          <div className="flex flex-col items-center justify-between gap-2">
            {children}
          </div>
        </div>
      );

    case "form":
      return (
        <div
          className={
            `flex w-full flex-col gap-2 rounded-xl bg-white/50 p-6 shadow-lg dark:bg-black/60 ${isButton && sharedHover} ` +
            cardColors(variant)
          }
        >
          <div className="flex flex-col items-center justify-between gap-2">
            {children}
          </div>
        </div>
      );

    default:
      return <DefaultCard />;
  }
}
