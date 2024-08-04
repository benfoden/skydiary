import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

type TranslationKeys =
  | "form.strong"
  | "form.medium"
  | "form.weak"
  | "form.useAtLeast16Characters"
  | "form.useAtLeastOneUppercaseLetter"
  | "form.useAtLeastOneLowercaseLetter"
  | "form.useAtLeastOneNumber"
  | "form.useAtLeastOneSpecialCharacter";

function getPasswordStrength(password: string) {
  let strength = 0;
  if (password.length > 16) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
}

function getStrengthLabel(
  strength: number,
  length: number,
  t: (key: TranslationKeys) => string,
) {
  if (strength === 5) {
    return t("form.strong");
  } else if (strength === 4) {
    return t("form.medium");
  } else {
    return t("form.weak");
  }
}

function getRecommendations(
  password: string,
  t: (key: TranslationKeys) => string,
) {
  const recommendations = [];
  if (password.length < 16)
    recommendations.push(t("form.useAtLeast16Characters"));
  if (!/[A-Z]/.test(password))
    recommendations.push(t("form.useAtLeastOneUppercaseLetter"));
  if (!/[a-z]/.test(password))
    recommendations.push(t("form.useAtLeastOneLowercaseLetter"));
  if (!/[0-9]/.test(password))
    recommendations.push(t("form.useAtLeastOneNumber"));
  if (!/[!@#$%^&*()_+{}]/.test(password))
    recommendations.push(t("form.useAtLeastOneSpecialCharacter"));
  return recommendations;
}

export default function PasswordInput({
  password,
  setPassword,
}: {
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
}) {
  const t = useTranslations();
  const ref = useRef<HTMLInputElement>(null);

  const strength = getPasswordStrength(password);
  const strengthLabel = getStrengthLabel(strength, password.length, t);
  const recommendations = getRecommendations(password, t);
  const [isActive, setIsActive] = useState(false);

  const handleFocus = () => {
    setIsActive(true);
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

  return (
    <>
      <label>
        <div className="flex flex-row items-center justify-between">
          {t("form.password")}
          {password.length > 0 && (
            <span className="text-xs">{password.length}</span>
          )}
        </div>
        <input
          type="password"
          value={password}
          onFocus={handleFocus}
          className={`w-full rounded-md px-5 py-3 text-base outline-none transition placeholder:text-sm placeholder:font-light placeholder:text-black/60 placeholder:dark:text-white/80 ${isActive && "bg-white/80 transition dark:bg-white/[.18]"} bg-primary`}
          onChange={(e) => setPassword(e.target.value)}
          minLength={16}
          maxLength={128}
        />
      </label>
      <div>
        {password.length > 0 && (
          <>
            {t("form.passwordStrength")}: {strengthLabel}
          </>
        )}
        {strengthLabel !== t("form.strong") && password.length > 0 && (
          <ul>
            {recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
