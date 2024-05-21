export default function Button({
  variant = "primary",
  children,
  ...props
}: {
  variant?: "primary" | "text" | "menuElement" | "cta" | "chip";
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  let buttonClass = "";
  const defaultButton =
    " flex items-center justify-between px-4 py-2 gap-4 rounded-full bg-white/30 no-underline transition hover:bg-white/60";
  switch (variant) {
    case "primary":
      buttonClass += defaultButton;
      break;
    case "text":
      buttonClass +=
        " flex items-center justify-between px-4 py-2 rounded-full text-decoration-none no-underline transition text-primary hover:bg-white/60";
      break;
    case "menuElement":
      buttonClass +=
        " flex px-6 py-3 sm:px-4 sm:py-2 items-center justify-between gap-4 w-full rounded text-decoration-none no-underline transition text-primary hover:bg-white/60";
      break;
    case "cta":
      buttonClass +=
        " flex px-6 py-3 sm:px-4 sm:py-2 items-center justify-between gap-4 rounded-full text-decoration-none no-underline transition text-primary bg-white/80 hover:bg-white";
      break;
    case "chip":
      buttonClass +=
        " flex px-2 py-1 items-center justify-between gap-4 rounded-full text-decoration-none no-underline transition text-xs font-medium bg-white/40 hover:bg-white/60";
      break;
    default:
      buttonClass += defaultButton;
      break;
  }

  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
}
