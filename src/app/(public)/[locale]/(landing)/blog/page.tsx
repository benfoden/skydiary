import Link from "next/link";
import { Card } from "~/app/_components/Card";
import { getSortedPostsData, type IndexPostData } from "~/utils/posts";
import { formattedTimeStampToDate } from "~/utils/text";

export default function BlogIndex() {
  const allPostsData: IndexPostData[] = getSortedPostsData();

  return (
    <>
      <h1 className="text-lg font-light">blog</h1>

      <section className="mt-10 flex w-full max-w-[600px] flex-col gap-4">
        <ul>
          {allPostsData.map(({ id, date, title, content }) => (
            <li key={id}>
              <Link href={`/blog/${id}`}>
                <Card>
                  <div className="flex w-full flex-col items-start">
                    <h2 className="text-4xl font-light">{title}</h2>
                    <span className="text-xs opacity-70">
                      {formattedTimeStampToDate(new Date(date))}
                    </span>
                  </div>
                  {content.length > 280
                    ? content.slice(0, 280) + "..."
                    : content}
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
