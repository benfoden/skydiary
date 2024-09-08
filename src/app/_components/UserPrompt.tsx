import { api } from "~/trpc/server";

export default async function UserPrompt() {
  const prompts = await api.userPrompt.getByUserId();

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      {prompts?.map((prompt) => (
        <div key={prompt.id}>
          <div className="flex w-full flex-row items-center justify-between gap-4">
            <div className="flex w-full flex-row items-center gap-2">
              <div className="flex h-8 w-8 flex-row items-center justify-center rounded-full bg-sky-500 text-white">
                <div className="h-4 w-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  </svg>
                </div>
              </div>
            </div>
            {/* <div className="flex w-full flex-row items-center gap-2">
             {
               prompt.tagId && (
                 <Link href={`/topics/${prompt.tagId}`}>
                   <Button variant="text">
                     <span className="text-xs font-medium">
                       {prompt.tagId}
                     </span>
                   </Button>
                 </Link>
               )
             }
           </div> */}
            <div className="flex w-full flex-row items-center gap-2">
              <div className="flex h-8 w-8 flex-row items-center justify-center rounded-full bg-sky-500 text-white">
                <div className="h-4 w-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  </svg>
                </div>
              </div>
              {prompt.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
