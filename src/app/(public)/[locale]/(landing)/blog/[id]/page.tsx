import { Card } from "~/app/_components/Card";
import { getPostData } from "~/utils/posts";
import { formattedTimeStampToDate } from "~/utils/text";

type Params = {
  id: string;
};

type Props = {
  params: Params;
};

type PostData = {
  title: string;
  date: string;
  contentHtml: string;
};

export async function generateMetadata({ params }: Props) {
  const postData: PostData = await getPostData(params.id);

  return {
    title: postData.title,
  };
}

// -< Post >-
export default async function Post({ params }: Props) {
  const postData: PostData = await getPostData(params.id);

  return (
    <div className="flex w-full max-w-[600px] flex-col gap-4">
      <h1 className="text-3xl font-light">{postData.title}</h1>

      <div className="font-base mb-5">
        {formattedTimeStampToDate(new Date(postData.date))}
      </div>
      <Card isButton={false}>
        <div id="blog">
          <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
        </div>
      </Card>
    </div>
  );
}
