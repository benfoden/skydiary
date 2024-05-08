import { Nav } from "./_components/nav";

export default async function Top() {
  return (
    <>
      <Nav />
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <div className="flex flex-col items-center gap-2">welcome</div>
        </div>
      </main>
    </>
  );
}
