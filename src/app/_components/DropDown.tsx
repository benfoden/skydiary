"use client";
import {
  DotsHorizontalIcon,
  DotsVerticalIcon,
  HamburgerMenuIcon,
} from "@radix-ui/react-icons";
import { useState } from "react";

import { useEffect, useRef } from "react";
import Button from "./Button";

const DropDownMenu = ({
  children,
  isUserMenu = false,
  isEntryMenu = false,
  isTopMenu = false,
}: {
  children: React.ReactNode;
  isUserMenu?: boolean;
  isEntryMenu?: boolean;
  isTopMenu?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setOpen(!open);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!children) return null;

  return (
    <div
      ref={dropdownRef}
      className={`relative flex flex-col items-end ${open ? "open" : ""} ${isUserMenu && "mr-4"}`}
    >
      <Button variant="dropdownToggle" onClick={toggleDropdown}>
        {isUserMenu && <HamburgerMenuIcon className="h-6 w-6" />}
        {isEntryMenu && <DotsHorizontalIcon className="h-6 w-6" />}
        {isTopMenu && <HamburgerMenuIcon className="h-6 w-6" />}
        {!isUserMenu && !isEntryMenu && !isTopMenu && (
          <DotsVerticalIcon className="h-6 w-6" />
        )}
      </Button>
      {open && (
        <div
          className="absolute z-10 mt-10 flex min-w-max flex-col rounded-md bg-white/20 shadow-lg transition dark:bg-white/[.08]"
          style={{
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            WebkitBackfaceVisibility: "hidden",
            MozBackfaceVisibility: "hidden",
            WebkitTransform: "translate3d(0, 0, 0)",
            MozTransform: "translate3d(0, 0, 0)",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default DropDownMenu;
