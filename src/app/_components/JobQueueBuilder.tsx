"use client";

import { api } from "~/trpc/react";

import {
  type Comment,
  type Persona,
  type Post,
  type Tag,
} from "@prisma/client";
import { useEffect, useState } from "react";

export type PostsWithCommentsAndTags = Post & {
  comments: Comment[];
  tags: Tag[];
};

export interface JobQueue {
  postsWithCommentsAndTags: PostsWithCommentsAndTags[];
  personas: Persona[];
}

export default function JobQueueBuilder() {
  const [jobQueue, setJobQueue] = useState<JobQueue>();
  const { data: postsWithCommentsAndTags, isSuccess: isSuccessPosts } =
    api.post.getByUserForJobQueue.useQuery();
  const { data: personas, isSuccess: isSuccessPersonas } =
    api.persona.getByUserForJobQueue.useQuery();

  useEffect(() => {
    try {
      if (isSuccessPosts && isSuccessPersonas) {
        setJobQueue({
          postsWithCommentsAndTags: postsWithCommentsAndTags,
          personas: personas,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [isSuccessPosts, isSuccessPersonas, postsWithCommentsAndTags, personas]);

  //todo: process the job queue for each jobToDo and save the results in the DB

  return <></>;
}
