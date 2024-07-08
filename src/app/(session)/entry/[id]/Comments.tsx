"use client";

import { type Comment, type Persona, type User } from "@prisma/client";
import { CircleIcon, PersonIcon, PlusIcon } from "@radix-ui/react-icons";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import Button from "~/app/_components/Button";
import { Card } from "~/app/_components/Card";
import DeleteButton from "~/app/_components/DeleteButton";
import FormButton from "~/app/_components/FormButton";
import { PersonaIcon } from "~/app/_components/PersonaIcon";
import { productPlan } from "~/utils/constants";
import { formattedTimeStampToDate } from "~/utils/text";
import { deleteComment } from "./serverFunctions";

export default function Comments({
  user,
  isLoading,
  comments,
  personas,
  postId,
}: {
  user: User;
  isLoading: boolean;
  comments: Comment[];
  personas?: Persona[];
  postId: string;
}) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="flex h-full w-full flex-col items-center pb-4">
      <div className="flex w-full flex-row items-start justify-center gap-2">
        <ul className="flex w-full flex-row flex-wrap justify-start gap-2">
          <FormButton isDisabled={isLoading}>
            <div className="flex flex-row items-center gap-2 text-xs">
              <CircleIcon className="h-4 w-4" />
              sky
            </div>
          </FormButton>

          {!personas?.length && (
            <Link href="/persona/all">
              <Button>
                <PlusIcon className="h-4 w-4" />
                <span className="text-xs">{t("nav.addPersonas")}</span>
              </Button>
            </Link>
          )}
          {personas
            ?.slice(
              0,
              user?.isSpecial
                ? personas.length - 1
                : productPlan(user?.stripeProductId)?.personas,
            )
            .map((persona: Persona) => (
              <Button disabled={isLoading} key={persona.id}>
                <div className="flex flex-row items-center gap-2 font-medium">
                  {persona.image ? (
                    <>
                      <Image
                        alt={persona.name}
                        src={persona.image}
                        width="16"
                        height="16"
                        className="rounded-full"
                      />
                      <span className="text-xs">{persona.name}</span>
                    </>
                  ) : (
                    <>
                      <PersonIcon className="h-4 w-4" />
                      <span className="text-xs">{persona.name}</span>
                    </>
                  )}
                </div>
              </Button>
            ))}
        </ul>
      </div>

      {comments && (
        <ul className="flex flex-col gap-4 pt-6">
          {comments
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .map((comment) => (
              <li key={comment.id} className="flex flex-col rounded-lg">
                <Card isButton={false}>
                  <div className="flex w-full flex-col gap-4 py-4">
                    <div className="flex w-full justify-between gap-4 text-xs">
                      <div className="font-medium">
                        <PersonaIcon
                          personaId={comment.createdByPersonaId ?? ""}
                          personas={personas}
                          coachVariant={comment.coachVariant ?? ""}
                        />
                      </div>
                      <div className="flex flex-row items-center gap-2">
                        {formattedTimeStampToDate(comment.createdAt, locale)}

                        <DeleteButton
                          hasText={false}
                          onClick={async () =>
                            await deleteComment({
                              commentId: comment.id,
                              postId,
                              isLoading: isLoading,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="text-sm">{comment.content}</div>
                  </div>
                </Card>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
