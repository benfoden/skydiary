"use client";
import { type Persona } from "@prisma/client";
import { useEffect, useState } from "react";
import Button from "~/app/_components/Button";
import { Card } from "~/app/_components/Card";
import FormButton from "~/app/_components/FormButton";
import Input from "~/app/_components/Input";
import { api } from "~/trpc/react";

export default function ChatThread({
  firstMessage,
  currentUserPersona,
}: {
  firstMessage: string;
  currentUserPersona: Persona;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<
    { personaId: string | undefined | null; content: string }[]
  >([{ personaId: "system", content: firstMessage }]);

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [activePersona, setActivePersona] = useState<Persona | undefined>();

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
          aiPersona: personas.find((persona) => persona.isUser === false),
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

  useEffect(() => {
    setActivePersona(personas[0]);
  }, [personas]);

  return (
    <>
      <Card isButton={false}>
        <div>
          {personas.map((persona) => (
            <Button key={persona.id} onClick={() => setActivePersona(persona)}>
              {persona.name}
            </Button>
          ))}
        </div>
      </Card>
      <Card isButton={false}>
        {messages.slice(1).map((message, index) => (
          <Card key={index} isButton={false}>
            <div key={index} className="flex w-full flex-row items-start gap-2">
              <p>
                {message.personaId === currentUserPersona?.id &&
                  currentUserPersona.name}
                {message.personaId === activePersona?.id && activePersona?.name}
                :
              </p>
              <p>{message.content}</p>
            </div>
          </Card>
        ))}
        <p>{activePersona?.name}</p>
        <form onSubmit={(event) => handleCommand(event)}>
          <Input id="chatInput" />
          <FormButton isDisabled={isLoading} variant="submit">
            Enter
          </FormButton>
        </form>
      </Card>
    </>
  );
}
