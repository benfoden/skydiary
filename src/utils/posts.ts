// matter is a library that let's you parse the metadata in each markdown file.
// the lib folder does not have an assigned name like the pages folder, so you can name it anything. It's usually convention to use lib or utils

import fs from "fs";
import path from "path";

// Import 'gray-matter', library for parsing the metadata in each markdown file
import matter from "gray-matter";

// Import 'remark', library for rendering markdown
import { remark } from "remark";
import html from "remark-html";

// Define types for post data
interface PostData {
  id: string;
  title: string;
  date: string;
  contentHtml: string;
}

export interface IndexPostData {
  date: string;
  title: string;
  id: string;
  content: string;
}

const postsDirectory = path.join(process.cwd(), "posts");

export function getSortedPostsData(): IndexPostData[] {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory); // [ 'pre-rendering.md', 'ssg-ssr.md' ]

  // Get the data from each file
  const allPostsData: IndexPostData[] = fileNames.map((filename) => {
    // Remove ".md" from file name to get id
    const id = filename.replace(/\.md$/, ""); // id = 'pre-rendering', 'ssg-ssr'

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, filename);
    // /Users/ef/Desktop/nextjs-blog/posts/pre-rendering.md
    const fileContents = fs.readFileSync(fullPath, "utf8"); // .md string content

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      id,
      content: matterResult.content,
      ...(matterResult.data as {
        date: string;
        title: string;
      }),
    };
  });

  // Sort posts by date and return
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds(): { params: { id: string } }[] {
  const fileNames = fs.readdirSync(postsDirectory);

  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ""),
      },
    };
  });
}

export async function getPostData(id: string): Promise<PostData> {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Combine the data with the id
  return {
    id,
    contentHtml,
    ...(matterResult.data as { date: string; title: string }),
  };
}
