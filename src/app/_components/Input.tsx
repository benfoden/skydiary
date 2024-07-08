"use client";
import { useEffect, useRef, useState } from "react";

export default function Input({
  type,
  label,
  ...props
}: {
  type?: "text" | "textarea" | "number" | "email" | "password" | "checkbox";
  label: string;
} & React.InputHTMLAttributes<
  | HTMLInputElement
  | HTMLTextAreaElement
  | (HTMLInputElement & { type: "checkbox" })
>) {
  const { id, value, defaultValue } = props;
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isValueLength, setIsValueLength] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const handleFocus = () => {
    setIsActive(true);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (type === "checkbox") {
      setIsChecked((event.target as HTMLInputElement).checked);
    } else {
      setIsValueLength(event.target.value.trim().length > 0);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (value) {
      setIsActive(true);
    }
  }, [value]);

  useEffect(() => {
    if (type === "checkbox") {
      setIsValueLength(!!defaultValue);
    } else if (
      typeof defaultValue === "string" ||
      Array.isArray(defaultValue)
    ) {
      setIsValueLength(defaultValue.length > 0);
    } else if (typeof defaultValue === "number") {
      setIsValueLength(defaultValue > 0);
    } else {
      setIsValueLength(false);
    }
  }, [defaultValue, type]);

  return (
    <div className={`relative flex w-full flex-col items-start`}>
      <label
        className={`text-nowrap bg-transparent bg-none px-5 py-1 text-sm ${isValueLength && "text-secondary transition"}`}
        htmlFor={id}
      >
        {label}
      </label>
      {type !== "textarea" && type !== "checkbox" && (
        <input
          type={type ?? "text"}
          {...props}
          value={value}
          className={`w-full rounded-md py-3 pl-5 pr-10 text-base outline-none transition placeholder:text-sm placeholder:font-light ${isActive && "bg-white/80 transition dark:bg-white/[.18]"} bg-primary`}
          ref={ref as React.RefObject<HTMLInputElement>}
          onFocus={handleFocus}
          onChange={(e) => {
            if (props.onChange) {
              props.onChange(e);
            }
            handleChange(e);
          }}
        />
      )}
      {type === "textarea" && (
        <textarea
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          className={`w-full rounded-md py-4 pl-5 pr-10 outline-none transition placeholder:text-sm placeholder:font-light ${isActive && "bg-white/80 dark:bg-white/[.18]"} bg-primary`}
          ref={ref as React.RefObject<HTMLTextAreaElement>}
          onFocus={handleFocus}
          onChange={handleChange}
          rows={7}
        />
      )}
      {type === "checkbox" && (
        <input
          type={type ?? "checkbox"}
          {...props}
          checked={isChecked}
          className={`mb-4 ml-5 mt-1 ${props.disabled && "cursor-not-allowed"}`}
          ref={ref as React.RefObject<HTMLInputElement>}
          onFocus={handleFocus}
          onChange={(e) => {
            if (props.onChange) {
              props.onChange(e);
            }
            handleChange(e);
          }}
        />
      )}
    </div>
  );
}
