import { remark } from "remark";
import html from "remark-html";

export const formatContent = async (content: string) => {
  const result = await remark().use(html).process(content);
  return result.toString();
};
