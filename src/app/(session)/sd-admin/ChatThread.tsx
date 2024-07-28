"use client";
import { type Persona, type User } from "@prisma/client";
import { useEffect, useState } from "react";
import { Avatar } from "~/app/_components/Avatar";
import { Card } from "~/app/_components/Card";
import FormButton from "~/app/_components/FormButton";
import Input from "~/app/_components/Input";
import { api } from "~/trpc/react";

export default function ChatThread({
  firstMessage,
  currentUserPersona,
  user,
}: {
  firstMessage: string;
  currentUserPersona: Persona;
  user: User;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<
    { personaId: string | undefined | null; content: string }[]
  >([{ personaId: "system", content: firstMessage }]);

  const [personas, setPersonas] = useState<Persona[]>([]);

  const { data: personasData, isSuccess } =
    api.persona.getAllByUserId.useQuery();

  const handleCommand = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const chatInput =
      e.currentTarget.querySelector<HTMLInputElement>("#chatInput");
    const currentContent = chatInput?.value ?? "";

    if (!currentContent || currentContent.length === 0) return;

    const newCommand = {
      personaId: currentUserPersona?.id,
      content: currentContent,
    };

    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, newCommand],
          userPersona: currentUserPersona,
          aiPersona: personas.find(
            (persona) => persona.id === "clxyqqo3l00005ep3t8amw32a",
          ),
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const reply = (await response.json()) as {
        newMessage: {
          personaId: string | null | undefined;
          content: string;
        };
      };
      setMessages((prevMessages) => [
        ...prevMessages,
        newCommand,
        reply.newMessage,
      ]);
    } catch (error) {
      console.error("Failed to fetch new messages:", error);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (isSuccess && personasData) {
      setPersonas(personasData);
    }
  }, [personasData, isSuccess]);

  return (
    <div className="my-4 w-full md:max-w-2xl">
      <Card isButton={false}>
        <div className="w-full">
          {messages.slice(1).map((message, index) => (
            <Card key={index} isButton={false}>
              <div
                key={index}
                className="flex w-full flex-row items-start gap-2"
              >
                {message.personaId === currentUserPersona?.id && (
                  <Avatar src={user?.image ?? ""} alt="me" size="medium" />
                )}
                {personas.find(
                  (persona) => persona.id === message.personaId,
                ) && (
                  <Avatar
                    src={
                      personas.find(
                        (persona) => persona.id === message.personaId,
                      )?.image ?? ""
                    }
                    alt="them"
                    size="medium"
                  />
                )}
                <p>{message.content}</p>
              </div>
            </Card>
          ))}

          <form
            onSubmit={(event) => handleCommand(event)}
            className="flex w-full flex-col"
          >
            <Input id="chatInput" />
            <FormButton isDisabled={isLoading} variant="submit">
              enter
            </FormButton>
          </form>
        </div>
      </Card>
    </div>
  );
}
