"use client";
import { Cross1Icon } from "@radix-ui/react-icons";
import { useState } from "react";
import Button from "./Button";
import Modal from "./Modal";

export default function InviteModal({
  status,
  children,
}: {
  status?: string;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  //todo: show done message if st = 1 or 2
  return !isOpen && status !== "2" ? (
    <Button variant="chip" isSpecial onClick={() => setIsOpen(true)}>
      tell up to 2 friends
    </Button>
  ) : (
    <Modal>
      <div className="mr-[-24px] flex w-full flex-row items-end justify-end">
        <Button variant="text" onClick={() => setIsOpen(false)}>
          <Cross1Icon className="h-4 w-4" />
        </Button>
      </div>
      {children}
    </Modal>
  );
}
