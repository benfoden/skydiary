export default function Button({
  variant = "primary",
  children,
  ...props
}: {
  variant?: "primary" | "text" | "menuElement";
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  let buttonClass = "";
  const defaultButton =
    " px-4 py-2 rounded-full bg-white/30 no-underline transition hover:bg-white/60";
  switch (variant) {
    case "primary":
      buttonClass += defaultButton;
      break;
    case "text":
      buttonClass +=
        " px-4 py-2 rounded-full text-decoration-none no-underline text-primary hover:bg-white/60";
      break;
    case "menuElement":
      buttonClass +=
        " px-6 py-3 sm:px-4 sm:py-2 flex items-start w-full rounded text-decoration-none no-underline text-primary hover:bg-white/60";
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
