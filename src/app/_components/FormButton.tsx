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
  onClick?: () => void;
  isSpecial?: boolean;
}) {
  const { pending }: { pending: boolean } = useFormStatus();
  return (
    <Button
      variant={variant}
      type="submit"
      disabled={pending || isDisabled}
      onClick={onClick}
      isSpecial={isSpecial}
      {...props}
    >
      {pending ? <ButtonSpinner /> : children}
    </Button>
  );
}
