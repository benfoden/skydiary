"use client";
import { CheckIcon, Cross1Icon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Button from "./Button";
import ButtonSpinner from "./ButtonSpinner";

export default function FormDeleteButton({
  hasText = true,
}: {
  hasText?: boolean;
}) {
  const { pending }: { pending: boolean } = useFormStatus();
  const t = useTranslations();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [readyToDelete, setReadyToDelete] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (confirmDelete) {
      timer = setTimeout(() => {
        setConfirmDelete(false);
      }, 5000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [confirmDelete]);

  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirmDelete && readyToDelete) {
      event.preventDefault();
      setConfirmDelete(true);
      setReadyToDelete(false);
      setTimeout(() => {
        setReadyToDelete(true);
      }, 500);
    }
  };

  return (
    <Button
      variant="menuElement"
      type="submit"
      disabled={pending || !readyToDelete}
      onClick={handleDelete}
    >
      {pending ? (
        <>
          {t("status.deleting")}
          <ButtonSpinner />
        </>
      ) : confirmDelete ? (
        <>
          {hasText && t("form.confirmDelete")} <CheckIcon className="h-5 w-5" />{" "}
        </>
      ) : (
        <>
          <Cross1Icon className="h-5 w-5" /> {hasText && t("form.delete")}
        </>
      )}
    </Button>
  );
}
