import { getTranslations } from "next-intl/server";
import { stringifyError } from "next/dist/shared/lib/utils";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import ClientPage from "./ClientPage";

export default async function ExportPage() {
  const session = await getServerAuthSession();
  const t = await getTranslations();
  let outputError;
  let exportData;
  if (!session?.user) {
    console.error("No user session found for export");
    outputError = "Unauthorized. Please log in to export your data.";
  }
  try {
    const [exportUser, exportPersonas, exportPosts] = await Promise.all([
      api.user.getUserForExport(),
      api.persona.getAllByUserForExport(),
      api.post.getAllByUserForExport(),
    ]);

    if (
      exportUser === null ||
      exportPersonas === null ||
      exportPosts === null
    ) {
      console.error("Error getting export data");
      outputError =
        "Error getting export data. Plesase contact us at contact@skydiary.app";
    }

    exportData = {
      exportUser,
      exportPersonas,
      exportPosts,
    };
  } catch (error) {
    outputError = stringifyError(
      error instanceof Error ? error : new Error(String(error)),
    );

    console.error(error);
  }

  const json = JSON.stringify(exportData, null, 2);

  return (
    <div className="flex flex-col items-start justify-center gap-4 p-4">
      <h1 className="text-xl">{t("settings.exportDataTitle")}</h1>
      <ClientPage
        json={json}
        error={outputError ?? null}
        isLoading={!exportData}
      />
    </div>
  );
}
