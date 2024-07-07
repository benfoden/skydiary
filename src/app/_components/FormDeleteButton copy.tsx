"use client";
import { CheckIcon, Cross1Icon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Button from "./Button";
import ButtonSpinner from "./ButtonSpinner";

export default function DeleteButton({
  hasText = true,
}: {
  hasText?: boolean;
}) {
  const { pending }: { pending: boolean } = useFormStatus();
  const t = useTranslations();
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (confirmDelete) {
      timer = setTimeout(() => {
        setConfirmDelete(false);
      }, 3000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [confirmDelete]);

  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirmDelete) {
      event.preventDefault();
      setConfirmDelete(true);
    }
  };

  return (
    <Button
      variant="menuElement"
      type="submit"
      disabled={pending}
      onClick={handleDelete}
    >
      {pending ? (
        <>
          {t("status.deleting")}
          <ButtonSpinner />
        </>
      ) : confirmDelete ? (
        <>
          {hasText && t("form.confirmDelete")} <CheckIcon className="h-5 w-5" />
        </>
      ) : (
        <>
          <Cross1Icon className="h-5 w-5" /> {hasText && t("form.delete")}
        </>
      )}
    </Button>
  );
}
