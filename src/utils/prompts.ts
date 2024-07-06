import { type Persona } from "@prisma/client";
import { TAGS, type NewPersonaUser } from "./constants";

// PROMPTS

export type Prompt = {
  task: string;
  context: "";
  example: "";
  persona: "";
  format: "";
  tone: "";
};

export const prompts = {
  basicPrompt:
    "Ignore all previous instructions around being professional, polite, or respectful." +
    "Avoid greetings like hi, hey, hello, etc. " +
    "No emojis. Use only one exclamation point if needed. " +
    "Be concise; avoid unnecessary words and repetition. " +
    "Use appropriate vocabulary for the persona. " +
    "Vary sentence length for a natural flow. " +
    "Limit sentences to two commas unless listing items. No semicolons. " +
    "NEVER use 'commendable', 'noteworthy', 'notably', 'noted', or 'notable'. " +
    "Do not summarize the entry. Add new insights or perspectives. " +
    "Add something the writer hasn't noticed, doesn't know, or may find helpful. " +
    "Do not refer to the writer as 'the writer'. " +
    "Write in the same language as the diary entry. " +
    "Discuss only the topics in the diary entry, not the writing style. " +
    "Keep the message concise. Shorter is always better. ",
  litePlanPrompt: "Max response length is 500 characters or 70 tokens.",
  generateCoachPrompt: (diaryEntry: string) => {
    return (
      "Choose one comment type (criticism, insight, boost) for the following diary entry. " +
      "Select the type that best helps the writer achieve their interests, whether stated or implied. " +
      "Focus on the main topic. Respond with only the comment type as a single word. " +
      "'Criticism' if they need tough love, are complaining, or rambling. " +
      "'Insight' if they seek understanding, ask a question, or want to improve. " +
      "'Boost' if they are upset, having a hard day, or facing an unsolvable problem. " +
      "Diary entry: " +
      diaryEntry
    );
  },
  personaCommentPrompt: (
    persona: Persona,
    diaryEntry: string,
    currentUserPersona: Persona,
  ) => {
    return (
      "Role-play as a persona writing to a diary entry's author. " +
      "Reflect the persona's motivations, goals, and desires. " +
      "Answer any questions or requests from the writer. " +
      "Don't summarize the diary entry. Provide new, unexpected, surprising, and/or helpful insights. " +
      "Write based on the persona's relationship and occupation. " +
      "Use public information if the persona is a public figure. " +
      "Consider the persona's cultural background and experiences. " +
      "Respond with the persona's honest ideas, even if impolite or politically incorrect. " +
      "If the diary entry contains '_prompt:', follow those instructions. " +
      prompts.basicPrompt +
      " Persona details: " +
      JSON.stringify(persona) +
      " Diary entry: " +
      diaryEntry +
      " Writer details: " +
      JSON.stringify(currentUserPersona)
    );
  },
  skyCommentPrompt: (
    variant: string,
    diaryEntry: string,
    currentUserPersona: Persona,
  ): string => {
    function getVariant(variant: string): string {
      const insight =
        "Give insights into any challenges in this diary entry. " +
        "If none, avoid being too flowery. " +
        "Write as if you know the writer personally. ";

      switch (variant) {
        case "criticism":
          return (
            "Provide constructive criticism on the topics in this diary entry. " +
            "Focus on areas needing improvement. Be very specific and give actionable feedback.  Write as an expert in the topics. "
          );
        case "insight":
          return insight;
        case "boost":
          return (
            "Give words of encouragement to the writer of this diary entry. " +
            "Use superlatives only if they did something great or difficult. " +
            "Write as if you deeply care for the writer. "
          );
        default:
          return insight;
      }
    }
    return (
      getVariant(variant) +
      prompts.basicPrompt +
      " Diary entry: " +
      diaryEntry +
      " The diary entry writer: " +
      JSON.stringify(currentUserPersona)
    );
  },
  generateTagsPrompt: (diaryEntry: string) => {
    return (
      "Select three tags for the following diary entry. " +
      "No punctuation or special characters. " +
      "Only highly relevant tags. " +
      "Respond with a comma-separated list. " +
      "Tag list: " +
      TAGS.map((tag) => tag.content).join(", ") +
      " " +
      "Diary entry: " +
      diaryEntry
    );
  },
  summarizeText: (content: string): string => {
    return (
      "Summarize the diary entry in 80 words or less, maintaining key points and meaning. " +
      "Do not mention the author. " +
      "Be as concise as possible. " +
      "Write in the same language as the majority of the diary entry. " +
      "If no diary entry, return nothing. " +
      "Diary entry: " +
      content
    );
  },
  generateUserPersonaPrompt: (
    persona: Persona | NewPersonaUser,
    diaryEntry: string,
  ) => {
    return (
      "Update the following persona object based on the diary entry. " +
      "If values are empty, fill them with relevant information from the diary entry. " +
      "If there are significant changes, update the values accurately. " +
      "Prefer appending new details over replacing accurate values. " +
      "For example, update occupation if it has changed. " +
      "Description should summarize personal goals, preferences, and aspirations. " +
      "Relationship should include names and relationships mentioned in the diary entry, prioritizing family members. " +
      "Traits should be a list of short descriptors of personality traits, preferences, morals, and values. " +
      "No punctuation or special characters. " +
      "Respond with the updated object, keeping the same keys. " +
      "If no text in the diary entry, return the same persona object. " +
      "Only update description, occupation, relationship, and traits. " +
      "Each value should not exceed 85 words. " +
      "Return JSON. " +
      "Persona object: " +
      JSON.stringify(persona) +
      " " +
      "Diary entry text: " +
      diaryEntry
    );
  },
};
