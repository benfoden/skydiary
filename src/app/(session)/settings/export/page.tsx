import { getServerAuthSession } from "~/server/auth";

export default async function Export() {
  const session = await getServerAuthSession();
  const sessionUser = session?.user;
  if (!sessionUser) {
    console.error("No user session found");
    return;
  }
  // const t = await getTranslations();

  return (
    <div>
      {/* <form
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
            const downloadLink = document.getElementById(
              "download",
            ) as HTMLAnchorElement;
            if (downloadLink) {
              downloadLink.href = url;
            }
            //todo: do this on server side?
            // replace(`${window.location.pathname}?status=ready`, {
            //   scroll: false,
            // });
          } catch (error) {
            console.error("Error exporting data:", error);
            throw new Error("Error exporting data");
          }
        }}
      >
        <FormButton>{t("settings.exportDataButton")}</FormButton>
      </form> */}
      <h1>Download JSON File</h1>
      <a href={`/api/export/${session?.user?.id}`} download="userData.json">
        Download JSON
      </a>
    </div>
  );
}
