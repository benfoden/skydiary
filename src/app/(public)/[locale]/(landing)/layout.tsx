import "~/styles/globals.css";
import { PublicFooter } from "./PublicFooter";
import { PublicNav } from "./PublicNav";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicNav />
      <main className="flex min-h-screen w-full flex-col items-start justify-start px-2 sm:px-8">
        <div className="my-8 flex w-full flex-col items-center justify-start gap-2">
          {children}
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
