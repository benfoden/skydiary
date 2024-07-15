import { DownloadIcon } from "@radix-ui/react-icons";
import { getTranslations } from "next-intl/server";
import FormButton from "~/app/_components/FormButton";
import { getServerAuthSession } from "~/server/auth";

export default async function Export({
  searchParams,
}: {
  searchParams: { status: string };
}) {
  const isReady = searchParams.status === "ready";
  const session = await getServerAuthSession();
  const sessionUser = session?.user;
  if (!sessionUser) {
    console.error("No user session found");
    return;
  }
  const t = await getTranslations();

  return (
    <div>
      <form
        action={async () => {
          "use server";
          try {
            const json = JSON.stringify(session?.user, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${session?.user?.name}_data-${new Date().toISOString()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Append the URL to the button with id download
            const downloadLink = document.getElementById("download");
            if (downloadLink) {
              downloadLink.href = url;
            }
            //todo: do this on server side?
            replace(`${window.location.pathname}?status=ready`, {
              scroll: false,
            });
          } catch (error) {
            console.error("Error exporting data:", error);
            throw new Error("Error exporting data");
          }
        }}
      >
        <FormButton>{t("settings.exportDataButton")}</FormButton>
      </form>
      <a href="#" id="download" download>
        <div className="flex items-center gap-2">
          <DownloadIcon className="h-4 w-4" />
          <span className="text-xs">{t("settings.downloadDataButton")}</span>
        </div>
      </a>
    </div>
  );
}
