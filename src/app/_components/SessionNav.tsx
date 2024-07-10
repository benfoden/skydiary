export async function SessionNav({ children }: { children: React.ReactNode }) {
  return (
    <nav className="container mx-auto flex w-full items-center justify-between bg-transparent py-4 pl-0 pr-0 sm:pr-4">
      {children}
    </nav>
  );
}
