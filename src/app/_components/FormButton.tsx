"use client";
import { useFormStatus } from "react-dom";
import Button from "./Button";
import ButtonSpinner from "./ButtonSpinner";

export default function FormButton({
  variant = "primary",
  isDisabled,
  children,
  props,
  onClick,
  isSpecial,
}: {
  variant?: "primary" | "menuElement" | "cta" | "chip" | "text" | "submit";
  isDisabled?: boolean;
  children: React.ReactNode;
  props?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isSpecial?: boolean;
}) {
  const { pending }: { pending: boolean } = useFormStatus();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.ctrlKey && e.key === "Enter" && onClick) {
      onClick(e as unknown as React.MouseEvent<HTMLButtonElement>);
    }
  };

  return (
    <Button
      variant={variant}
      type="submit"
      disabled={pending || isDisabled}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      isSpecial={isSpecial}
      {...props}
    >
      {pending ? <ButtonSpinner /> : children}
    </Button>
  );
}
