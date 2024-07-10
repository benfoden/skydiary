import { type Persona } from "@prisma/client";
import { type PersonaForPrompt, type Prompt } from "global";
import { TAGS, type NewPersonaUser } from "./constants";
import { cleanStringForPrompt } from "./text";
import { type CommentType } from "./types";

// PROMPTS

const basePromptComment = ({
  commentType,
  authorDetails,
  content,
  personaDetails,
  characters,
}: {
  commentType: CommentType;
  authorDetails: PersonaForPrompt;
  content: string;
  characters: number;
  personaDetails?: PersonaForPrompt;
  // authorMemories?: string,
}): Prompt => {
  const cleanDiaryEntry = cleanStringForPrompt(content);
  let commentFocus = "criticism";
  let persona = "Persona details: ";
  let tone = "Persona writing tone: ";

  switch (commentType) {
    case "custom":
      commentFocus =
        "When writing the comment role-play as a persona. " +
        "If the persona's name is known as a public figure, then use any and all information about them to expand on the persona details. " +
        "You can reference any experiences the persona shares with the author. " +
        "Respond with the persona's honest ideas, even if impolite or politically incorrect. " +
        +"  ";
      persona += personaDetails
        ? " Persona Name: " +
          personaDetails.name +
          " Persona Age: " +
          personaDetails.age +
          " Persona Identity: " +
          personaDetails.gender +
          " Persona Description: " +
          personaDetails.description +
          " Persona Occupation: " +
          personaDetails.occupation +
          " Persona Relationship to author: " +
          personaDetails.relationship +
          " Persona Personality Traits: " +
          personaDetails.traits +
          " "
        : " ";
      tone += personaDetails?.communicationStyle;
      break;
    case "criticism":
      commentFocus =
        "Provide constructive criticism on the topics this diary entry. " +
        "Focus on areas needing improvement. Be very specific and give actionable feedback. ";
      persona += "A professional expert in the main topics of the diary. ";
      tone += "professional, direct, confident";
    case "insight":
      commentFocus = "Give insights into the topics this diary entry. ";
      persona += "A colleague and friend of the author. ";
      tone += "friendly, clear, helpful";
      break;
    case "boost":
      commentFocus =
        "Give words of encouragement to author on topics of diary entry. " +
        "Use superlatives carefully, and only if they did something truly great or very difficult for themselves to do. ";
      persona += "A close personal friend of the author. ";
      tone += "casual, friendly, and optimistic";
      break;
    default:
      commentFocus = "criticism";
  }

  return {
    task: "Write a comment about a diary entry for author. ",
    authorDetails:
      Object.entries(authorDetails)
        .map(([key, value]) => `Author ${key}: ${value}`)
        .join(". ") + ". End author details. ",
    diaryEntry:
      "Begin diary entry text:\n" +
      cleanDiaryEntry +
      "\n End diary entry text. ",
    context:
      "Begin comment rules: " + commentFocus + " . End of comment rules. ",
    persona: persona + " . End persona details. ",
    exemplars: personaDetails?.communicationSample
      ? " Persona writing sample: " +
        personaDetails.communicationSample +
        "End writing sample. "
      : " ",
    format:
      "Begin comment format rules: " +
      "Don't use any greetings like hi, hey, hello, etc. " +
      "Don't introduce yourself." +
      "Don't use any emoji. " +
      "Don't use more than one exclamation point. " +
      "Vary sentence length for a natural flow. " +
      "Don't use excessive vocabulary. " +
      "Don't express platitudes. " +
      "Never use any of these words in the comment: admirable, commendable, noteworthy, notably, noted, or notable. " +
      "Don't summarize the entry in the comment. Add something new, unique, insightful, or surprising. " +
      "Don't refer to the author as 'the author'. Instead use you, your, etc. " +
      "Try to write something new, insightful, or surprsing to the author. " +
      "Don't talk about the author's writing style. " +
      "Write the comment in the same language as the majority of the diary entry. " +
      "Answer any questions that may be in the diary entry. " +
      "Maximum comment length is " +
      Math.floor(characters / 4.5).toString() +
      " words and minimum is " +
      (Math.floor(characters / 4.5) * 0.33333).toString() +
      " words. " +
      "Use newline characters to separate paragraphs. ",
    tone,
  };
};

export const prompts = {
  comment: ({
    authorDetails,
    content,
    personaDetails,
    commentType = "custom",
    characters = 280,
  }: {
    authorDetails: PersonaForPrompt;
    content: string;
    commentType?: "custom" | "criticism" | "insight" | "boost";
    personaDetails?: PersonaForPrompt;
    characters?: number;
  }): string => {
    const filteredAuthorDetails = Object.fromEntries(
      Object.entries(authorDetails).filter(
        ([key, value]) =>
          ![
            "id",
            "image",
            "createdAt",
            "updatedAt",
            "createdById",
            "isUser",
          ].includes(key) && value,
      ),
    );

    const filteredPersonaDetails = personaDetails
      ? Object.fromEntries(
          Object.entries(personaDetails).filter(
            ([key, value]) =>
              ![
                "id",
                "image",
                "createdAt",
                "updatedAt",
                "createdById",
                "isUser",
              ].includes(key) && value != null,
          ),
        )
      : undefined;

    const prompt = basePromptComment({
      commentType,
      authorDetails: filteredAuthorDetails,
      content,
      personaDetails: filteredPersonaDetails,
      characters: characters * fastLogNormalRandom(),
    });
    return Object.values(prompt).join(" ");
  },

  summary: ({ content }: { content?: string }): string => {
    if (!content) return "no text found";
    return "Summarize 80 words or less: " + content;
  },

  tag: ({ content }: { content?: string }): string => {
    return (
      "Select tags from tag list for diary entry. " +
      "Only respond with a comma-separated list of up to three tags. " +
      "Tag list: " +
      TAGS.map((tag) => tag.content).join(", ") +
      " " +
      "Diary entry: " +
      content
    );
  },

  userPersona: ({
    persona,
    content,
    wordLimit = 10,
  }: {
    persona: Persona | NewPersonaUser;
    content: string;
    wordLimit?: number;
  }) => {
    return (
      "Update persona object with values that describe the author of the diary entry below as concisely as possible. " +
      "Only update existing values if they have changed. " +
      "Low priority values should be truncated first when words are limited. " +
      "Here are examples, listed in order of priority from high to low. " +
      "description: major goals, deep desires, main interests, and hobbies. " +
      "relationships: significant others, spouses, children, parents, siblings, coworkers, and friends." +
      "occupation: profession, job title, and organization if working, else student, housewife, retiree, volunteer, etc. " +
      "traits: core values, morals, preferences. " +
      "Do not add any special characters or emoji. " +
      "Return JSON with the updated object, keeping the same keys. " +
      "If no text in diary entry, return unchanged object. " +
      "Only update description, occupation, relationship, and traits values. " +
      "Each value should not exceed" +
      wordLimit.toString() +
      " words, except for the description value which has a maximum of " +
      (wordLimit * 3).toString() +
      " words. " +
      "Begin author persona object: " +
      JSON.stringify(persona) +
      " End author persona object. " +
      "Begin diary entry: " +
      content
    );
  },
};

// export const OLDprompts = {
//   basicPrompt:
//     "Do not use any greetings like hi, hey, hello, etc. " +
//     "No emojis. Use only one exclamation point if needed. " +
//     "Be concise; avoid unnecessary words and repetition. " +
//     "Use appropriate vocabulary for the persona. " +
//     "Vary sentence length for a natural flow. " +
//     "Limit sentences to two commas unless listing items. No semicolons. " +
//     "NEVER use 'commendable', 'noteworthy', 'notably', 'noted', or 'notable'. " +
//     "Do not summarize the entry. Add new insights or perspectives. " +
//     "Add something the author hasn't noticed, doesn't know, or may find helpful. " +
//     "Do not refer to the author as 'the author'. " +
//     "Write in the same language as the diary entry. " +
//     "Discuss only the topics in the diary entry, not the writing style. " +
//     "Keep the message concise. Shorter is always better. ",
//   litePlanPrompt: "Max response length is 500 characters or 70 tokens.",
//   generateCoachPrompt: (diaryEntry: string) => {
//     return (
//       "Choose one comment type (criticism, insight, boost) for the following diary entry. " +
//       "Select the type that best helps the author achieve their interests, whether stated or implied. " +
//       "Focus on the main topic. Respond with only the comment type as a single word. " +
//       "'Criticism' if they need tough love, are complaining, or rambling. " +
//       "'Insight' if they seek understanding, ask a question, or want to improve. " +
//       "'Boost' if they are upset, having a hard day, or facing an unsolvable problem. " +
//       "Diary entry: " +
//       diaryEntry
//     );
//   },
//   personaCommentPrompt: (
//     persona: Persona,
//     diaryEntry: string,
//     currentUserPersona: Persona,
//   ) => {
//     return (
//       "Role-play as a persona writing to a diary entry's author. " +
//       "Reflect the persona's motivations, goals, and desires. " +
//       "Answer any questions or requests from the author. " +
//       "Don't summarize the diary entry. Provide new, unexpected, surprising, and/or helpful insights. " +
//       "Write based on the persona's relationship and occupation. " +
//       "Use public information if the persona is a public figure. " +
//       "Consider the persona's cultural background and experiences. " +
//       "Respond with the persona's honest ideas, even if impolite or politically incorrect. " +
//       "If the diary entry contains '_prompt:', follow those instructions. " +
//       prompts.basicPrompt +
//       " Persona details: " +
//       JSON.stringify(persona) +
//       " Diary entry: " +
//       diaryEntry +
//       " author details: " +
//       JSON.stringify(currentUserPersona)
//     );
//   },
//   skyCommentPrompt: (
//     variant: string,
//     diaryEntry: string,
//     currentUserPersona: Persona,
//   ): string => {
//     function getVariant(variant: string): string {
//       const insight =
//         "Give insights into any challenges in this diary entry. " +
//         "If none, avoid being too flowery. " +
//         "Write as if you know the author personally. ";

//       switch (variant) {
//         case "criticism":
//           return (
//             "Provide constructive criticism on the topics in this diary entry. " +
//             "Focus on areas needing improvement. Be very specific and give actionable feedback.  Write as an expert in the topics. "
//           );
//         case "insight":
//           return insight;
//         case "boost":
//           return (
//             "Give words of encouragement to the author of this diary entry. " +
//             "Use superlatives only if they did something great or difficult. " +
//             "Write as if you deeply care for the author. "
//           );
//         default:
//           return insight;
//       }
//     }
//     return (
//       getVariant(variant) +
//       prompts.basicPrompt +
//       " Diary entry: " +
//       diaryEntry +
//       " The diary entry author: " +
//       JSON.stringify(currentUserPersona)
//     );
//   },
//   generateTagsPrompt: (diaryEntry: string) => {
//     return (
//       "Select three tags for the following diary entry. " +
//       "No punctuation or special characters. " +
//       "Only highly relevant tags. " +
//       "Respond with a comma-separated list. " +
//       "Tag list: " +
//       TAGS.map((tag) => tag.content).join(", ") +
//       " " +
//       "Diary entry: " +
//       diaryEntry
//     );
//   },
//   generateUserPersonaPrompt: (
//     persona: Persona | NewPersonaUser,
//     diaryEntry: string,
//   ) => {
//     return (
//       "Update the following persona object based on the diary entry. " +
//       "If values are empty, fill them with relevant information from the diary entry. " +
//       "If there are significant changes, update the values accurately. " +
//       "Prefer appending new details over replacing accurate values. " +
//       "For example, update occupation if it has changed. " +
//       "Description should summarize personal goals, preferences, and aspirations. " +
//       "Relationship should include names and relationships mentioned in the diary entry, prioritizing family members. " +
//       "Traits should be a list of short descriptors of personality traits, preferences, morals, and values. " +
//       "No punctuation or special characters. " +
//       "Respond with the updated object, keeping the same keys. " +
//       "If no text in the diary entry, return the same persona object. " +
//       "Only update description, occupation, relationship, and traits. " +
//       "Each value should not exceed 85 words. " +
//       "Return JSON. " +
//       "Persona object: " +
//       JSON.stringify(persona) +
//       " " +
//       "Diary entry text: " +
//       diaryEntry
//     );
//   },
// };

export const randomizedSkyAdvisor = () => {
  const rand = Math.random();
  if (rand < 0.15) return "boost";
  if (rand < 0.7) return "insight";
  if (rand < 0.85) return "criticism";
  return "insight";
};

export function fastLogNormalRandom(): number {
  return (Math.random() + Math.random() + Math.random()) * 0.333333;
}

export function gaussianRandom(stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const randomStdNormal =
    Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
  return randomStdNormal * stdDev;
}

export function gaussianRandomInRange(stdDev: number, range: number): number {
  if (range < stdDev) {
    throw new Error("Range should be bigger than the standard deviation!");
  }

  let randomValue;
  do {
    randomValue = gaussianRandom(stdDev);
  } while (Math.abs(randomValue) > range);

  return randomValue;
}

export function logNormalRandom(mean: number, stdDev: number): number {
  return Math.exp(gaussianRandom(stdDev)) * mean;
}

export function getRandomNumberNormalDist(range: number): number {
  if (range <= 70) {
    throw new Error("range must be greater than 70");
  }

  const mean = (70 + range) / 2;
  const stdDev = (range - 70) / 6; // 99.7% of values will fall within 3 standard deviations

  let randomValue;
  do {
    randomValue = mean + gaussianRandomInRange(stdDev, range - 70);
  } while (randomValue < 70 || randomValue > range);

  return randomValue;
}
