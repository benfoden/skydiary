import { useTranslations } from "next-intl";
import Link from "next/link";
import Button from "./_components/Button";
import { Card } from "./_components/Card";

export default function NotFound() {
  const t = useTranslations();
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div className="z-20 flex h-dvh flex-col items-center justify-center gap-4">
        <h1 className="mb-8 flex w-full items-center justify-center text-xl font-light">
          {t("error.notfound.heading")}
        </h1>
        <Card isButton={false}>
          <div className="flex flex-col items-center gap-3 text-sm">
            <p>{t("error.notfound.message")}</p>
            <Link href="/">
              <Button>{t("auth.back to home")}</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
