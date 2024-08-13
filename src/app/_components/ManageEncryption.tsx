"use client";

import { type User } from "@prisma/client";

export default function ManageEncryption({ user }: { user: User }) {
  // const mdkJwk = useMdkJwkLocal();

  // const [queue, setQueue] = useState<{
  //   posts: PostWithCommentsAndTags[];
  //   personas: Persona[];
  // }>({
  //   posts: [],
  //   personas: [],
  // });

  // const { data: postsData, isSuccess: isSuccessPosts } =
  //   api.post.getByUserForJobQueue.useQuery({ mdkJwk });
  // const { data: personasData, isSuccess: isSuccessPersonas } =
  //   api.persona.getByUserForJobQueue.useQuery();
  // const tagAndMemorize = api.post.tagAndMemorize.useMutation();
  // const bulkUpdatePersonas = api.persona.bulkUpdate.useMutation();
  // const updatePost = api.post.update.useMutation();

  // useEffect(() => {
  //   if (isSuccessPosts && isSuccessPersonas) {
  //     setQueue((prev) => ({
  //       posts: postsData,
  //       personas: prev.personas,
  //     }));
  //     let personasFiltered: Persona[] = [];
  //     if (personasData.length && user?.sukMdk && user?.passwordSalt && mdkJwk) {
  //       personasFiltered = personasData.filter((persona) => {
  //         persona.name && !persona.nameIV;
  //       });
  //     }
  //     setQueue((prev) => ({
  //       ...prev,
  //       personas: personasFiltered,
  //     }));
  //   }
  // }, [
  //   isSuccessPosts,
  //   isSuccessPersonas,
  //   postsData,
  //   personasData,
  //   mdkJwk,
  //   user?.sukMdk,
  //   user?.passwordSalt,
  // ]);

  // useEffect(() => {
  //   const newTagAndMemorizeQueue: PostWithCommentsAndTags[] = [];
  //   let newEncryptQueuePosts: PostWithCommentsAndTags[] = [];

  //   queue.posts.forEach((post) => {
  //     const isOldPost =
  //       new Date(post.createdAt) < new Date(Date.now() - 8 * 60 * 60 * 1000);
  //     const hasContent = post.content && post.content.length > 5;
  //     const hasNoTags = !post.tags?.length;
  //     const hasNoContentIV = !post.contentIV;

  //     if (hasContent && hasNoTags && isOldPost) {
  //       newTagAndMemorizeQueue.push(post);
  //     }

  //     if (
  //       user?.sukMdk &&
  //       user?.passwordSalt &&
  //       hasContent &&
  //       hasNoContentIV &&
  //       mdkJwk
  //     ) {
  //       newEncryptQueuePosts.push(post);
  //     }
  //   });

  //   if (newTagAndMemorizeQueue.length) {
  //     tagAndMemorize
  //       .mutateAsync(
  //         newTagAndMemorizeQueue.map((post) => ({
  //           id: post.id,
  //           content: post.content,
  //           tags: post.tags ? post.tags.map((tag) => tag.content) : [],
  //         })),
  //       )
  //       .catch((error) => {
  //         console.error("Error processing tagAndMemorizeQueue:", error);
  //       });
  //   }

  //   if (queue.personas.length) {
  //     const newEncryptQueuePersonas = queue.personas;
  //     bulkUpdatePersonas
  //       .mutateAsync({
  //         personas: newEncryptQueuePersonas,
  //         mdkJwk,
  //       })
  //       .then(() => {
  //         // Remove updated personas from the queue to prevent infinite loop
  //         setQueue((prevQueue) => ({
  //           ...prevQueue,
  //           personas: prevQueue.personas.filter(
  //             (persona) => !newEncryptQueuePersonas.includes(persona),
  //           ),
  //         }));
  //       })
  //       .catch((error) => {
  //         console.error("Error processing encryptQueue:", error);
  //       });
  //   }

  //   if (newEncryptQueuePosts.length && mdkJwk) {
  //     Promise.all(
  //       newEncryptQueuePosts.map(async (post) => {
  //         if (!post.content || (post.content && !post.contentIV)) {
  //           return;
  //         }
  //         const updatedPost = await updatePost.mutateAsync({
  //           postId: post.id,
  //           content: post.content ?? "",
  //           summary: post.summary ?? undefined,
  //           comments: post.comments?.map((comment) => ({
  //             id: comment.id,
  //             content: comment.content,
  //             coachName: comment.coachName ?? undefined,
  //           })),
  //           mdkJwk,
  //         });
  //         if (updatedPost) {
  //           newEncryptQueuePosts = newEncryptQueuePosts.filter((post) => post.id !== updatedPost.id);
  //         }
  //       }),
  //     ).catch((error) => {
  //       console.error("Error processing encryptQueue:", error);
  //     });
  //   }
  // }, [
  //   queue,
  //   user?.sukMdk,
  //   user?.passwordSalt,
  //   mdkJwk,
  //   tagAndMemorize,
  //   bulkUpdatePersonas,
  //   updatePost,
  // ]);

  return null;
}
