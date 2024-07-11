"use client";
import { useEffect, useRef, useState } from "react";

export default function Input({
  type,
  label,
  defaultChecked,
  initialValue,
  ...props
}: {
  type?: "text" | "textarea" | "number" | "email" | "password" | "checkbox";
  label?: string;
  defaultChecked?: boolean;
  initialValue?: string | number;
} & React.InputHTMLAttributes<
  | HTMLInputElement
  | HTMLTextAreaElement
  | (HTMLInputElement & { type: "checkbox" })
>) {
  if (!type) type = "text";
  const { id, value, defaultValue } = props;
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [valueLength, setValueLength] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(defaultChecked ?? false);

  const handleFocus = () => {
    setIsActive(true);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (type === "checkbox") {
      setIsChecked((event.target as HTMLInputElement).checked);
    } else {
      setValueLength(event.target.value.length);
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
    if (type === "checkbox") {
      setValueLength(null);
    } else if (
      typeof defaultValue === "string" ||
      Array.isArray(defaultValue)
    ) {
      setValueLength(defaultValue.length);
    } else if (typeof defaultValue === "number") {
      setValueLength(defaultValue.toString().length);
    } else {
      setValueLength(null);
    }
  }, [defaultValue, type]);

  useEffect(() => {
    if (value) {
      setIsActive(true);
    }
  }, [value]);

  return (
    <div className={`relative flex w-full flex-col items-start`}>
      <label
        className={`flex w-full flex-row items-center justify-between gap-2 text-nowrap bg-transparent bg-none px-5 py-1 text-sm ${valueLength !== null && "text-secondary transition"}`}
        htmlFor={id}
      >
        {label}
        {(type === "textarea" || type === "text") &&
          props.maxLength &&
          valueLength !== null &&
          valueLength > 0.5 * (props.maxLength ?? 0) && (
            <span
              className={`text-xs ${valueLength !== null && valueLength > 0.85 * (props.maxLength ?? 0) ? (valueLength === props.maxLength ? "text-red-600" : "text-yellow-500") : "text-secondary"}`}
            >
              {valueLength ?? 0} / {props.maxLength ?? 0}
            </span>
          )}
      </label>
      {type !== "textarea" && type !== "checkbox" && (
        <input
          type={type}
          {...props}
          value={initialValue ?? value}
          className={`w-full rounded-md px-5 py-3 text-base outline-none transition placeholder:text-sm placeholder:font-light placeholder:text-black/60 placeholder:dark:text-white/80 ${isActive && "bg-white/80 transition dark:bg-white/[.18]"} bg-primary ${props.disabled && "opacity-60"}`}
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
