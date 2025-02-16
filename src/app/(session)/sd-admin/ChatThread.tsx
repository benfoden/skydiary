"use client";
import { type Persona, type User } from "@prisma/client";
import { useRef, useState } from "react";
import { Avatar } from "~/app/_components/Avatar";
import FormButton from "~/app/_components/FormButton";
import Spinner from "~/app/_components/Spinner";

export default function ChatThread({
  firstMessage,
  currentUserPersona,
  aiPersona,
  user,
}: {
  firstMessage: string;
  currentUserPersona: Persona;
  aiPersona: Persona;
  user: User;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<
    { personaId: string | undefined | null; content: string }[]
  >([{ personaId: "user", content: firstMessage }]);
  const formRef = useRef<HTMLFormElement>(null);

  const handleCommand = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const chatInput =
      e.currentTarget.querySelector<HTMLInputElement>("#chatInput");
    const currentContent = chatInput?.value ?? "";

    if (!currentContent || currentContent.length === 0) {
      if (chatInput) chatInput.value = ""; // Clear the input even if no content
      return;
    }

    const newCommand = {
      personaId: currentUserPersona?.id,
      content: currentContent,
    }; // Clear the input after processing

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
          aiPersona,
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

      if (formRef.current) {
        formRef.current.reset();
      }
    } catch (error) {
      console.error("Failed to fetch new messages:", error);
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full gap-1 md:max-w-2xl">
      <div className="w-full gap-1">
        {messages.slice(1).map((message, index) => (
          <div key={index} className="rounded bg-white/10 px-2 py-1">
            <div key={index} className="flex w-full flex-row items-start gap-2">
              {message.personaId === currentUserPersona?.id && (
                <Avatar src={user?.image ?? ""} alt="me" size="medium" />
              )}

              {message.personaId === aiPersona.id && (
                <Avatar src={aiPersona.image ?? ""} alt="them" size="large" />
              )}

              <p>{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="my-2 flex w-full flex-row items-center justify-center">
            <Spinner />
          </div>
        )}

        <form
          onSubmit={(event) => handleCommand(event)}
          className="flex w-full flex-col"
          ref={formRef}
        >
          <textarea
            id="chatInput"
            className={`bg-primary w-full rounded-md py-4 pl-5 pr-10 outline-none transition placeholder:text-sm placeholder:font-light`}
            rows={5}
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === "Enter") {
                e.preventDefault();
                formRef.current?.dispatchEvent(
                  new Event("submit", { cancelable: true, bubbles: true }),
                );
              }
            }}
          />
          <FormButton isDisabled={isLoading} variant="submit">
            command
          </FormButton>
        </form>
      </div>
    </div>
  );
}
