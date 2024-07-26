import Link from "next/link";
import { Card } from "~/app/_components/Card";
import { getSortedPostsData } from "~/utils/posts";
import { formattedTimeStampToDate } from "~/utils/text";

type AllPostsData = {
  date: string;
  title: string;
  id: string;
  content: string;
}[];

export default function Blog() {
  const allPostsData: AllPostsData = getSortedPostsData();

  return (
    <>
      <h1 className="text-3xl font-light">skydiary blog</h1>

      <section>
        <ul>
          {allPostsData.map(({ id, date, title, content }) => (
            <li key={id}>
              <Link href={`/blog/${id}`}>
                <Card>
                  {title}
                  {content}
                  <span className="text-xs opacity-70">
                    {formattedTimeStampToDate(new Date(date))}
                  </span>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
