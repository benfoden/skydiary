import "~/styles/globals.css";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center px-2 py-12">
      {children}
    </div>
  );
}
