import { type Persona } from "@prisma/client";
import { TAGS, type NewPersonaUser } from "./constants";

// PROMPTS

export const prompts = {
  basicPrompt:
    "Do not start your reply with hi, hey, hello, etc. " +
    "Do not use any emoji. If you use an exclamation point, never use more than one. " +
    "Shorter is better so do not add unnecessary words and never repeat the same topics with different wording. " +
    "Do not use an excessive variety of vocabulary, but pick a level that is appropriate to the persona." +
    "Vary sentence length to maintain a natural flow of a conversatinal comment and to keep the reader engaged. " +
    "Do not write sentences that contain more than two commas unless you are writing a list of items. Never use semicolons in your response. " +
    "NEVER use the words 'commendable', 'noteworthy', 'notably', 'noted', or 'notable'. " +
    "Do not summarize the entry in your response. Always strive to add something new, something the writer didn't notice, or a fresh perspective on the topic. " +
    "Identify the main topic of the diary entry and focus on that. You do not need to address every topic in the diary entry. " +
    "Try to respond with something the writer didn't notice, may ultimately help them, or they may be interested in learning. " +
    "Address the writer directly, if possible. For example use 'you' or 'your' or if writing about people generally, use 'one should', 'one can...', etc. " +
    "Do not address the writer as 'the writer'. " +
    "Always reply with writing in the same language as the majority of the words in the diary entry. " +
    "Do not talk about writing style in any way, only the topics discussed in the diary entry. " +
    "Do not sign off with a closing statement. Do not sign your name. " +
    "Write your reply only as long as necessary to convey the message. Do not pad your response with fluffy commentary. The length must not exceed 280 words and should typically be around 140 words unless the entry is very long. ",
  generateCoachPrompt: (diaryEntry: string) => {
    return (
      "Based on these three types of comments (criticism, insight, boost) and a diary entry that will follow. " +
      "Please select one comment type that, if read by the writer, could help the person achieve their interests, whether plainly stated, implied, or discerned. Attempt to read between the lines and identify the main topic of the diary entry and focus on that. You do not need to address every topic in the diary entry." +
      "Respond with only the comment type as a single word text string and nothing else." +
      "If the person needs some tough love, or if they are complaining, or if they are rambling, then you could select 'criticism'." +
      "If the person is trying to get a better understanding of the topic, if they have an explicit question, or if they are trying to improve their skills, then you could select 'insight'." +
      "If the person is upset, or having a very hard day, or struggling with a problem with no immediate solution, then you could select 'boost'." +
      "Here is the diary entry text: " +
      diaryEntry
    );
  },
  personaCommentPrompt: (
    persona: Persona,
    diaryEntry: string,
    currentUserPersona: Persona,
  ) => {
    return (
      "Your goal is to role-play as accurately as possible as a persona writing a message to the writer of a diary entry. " +
      "The persona writing the message has their own motivations, goals, and desires that must be reflected clearly in their message. " +
      "The message should express the commenting persona's honest thoughts, feelings, and opinions overall, not only in relation to the diary entry. " +
      "If the writer of the diary asks a question or needs help, then the persona should answer the question as best as possible. " +
      "The persona's commentary, advice, criticism, or insights should be new to the writer, unexpected, surprising, and/or helpful for them. " +
      "Consider what the persona would write, based on how they would think about the writer's details and the diary entry. " +
      "Finally, write a message that fits exactly inside of the persona's relationship with the writer and the persona's occupation. " +
      "The persona's relationship and occupation details are very important to use when writing the message. " +
      "If the name of the persona in the persona details is a public figure then use public information to enrich the message. " +
      "If there any known writings or words from the public figure then you can use that as examples of their communication style to further improve the message. " +
      "Consider the cultural background of the persona, the country they are from, and the experiences they have likely had and have not had. " +
      "Only respond with ideas that the persona would honestly write, even if the persona is not politically correct, is impolite, or is otherwise bad in some way. This is extremely important. " +
      "Reflecting the persona accurately in the message is good for the writer and critically important. " +
      "If the diary entry contains an additional prompt with its beginning marked by the text '_prompt:' then add the instructions that follow to these when writing your message. " +
      prompts.basicPrompt +
      " Details of the persona writing the message: " +
      JSON.stringify(persona) +
      " Diary entry: " +
      diaryEntry +
      " Details about the diary entry writer: " +
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
        "Offer some insights into any challenges expressed in this diary entry. " +
        "If there are no challenges don't be too flowery. " +
        "Write as if you are someone who knows the writer personally. ";

      switch (variant) {
        case "criticism":
          return "Please provide constructive criticism on the topics expressed in the following diary entry. Do not hold back if there is any opportunity for improvement. Your goal is not to protect feelings but to protect results. Focus on the topic areas that need improvement and offer suggestions for how to improve. Be specific and provide examples to support your feedback. Write as if you are straight-shooter no-nonsense type that is an expert in the field of the topics in the entry:";
        case "insight":
          return insight;
        case "boost":
          return "Please provide some words that give a boost to the writer of this diary entry. Only use superlatives if the writer has done something really great or extremely difficult. Write your response as if you are an expert in the field of the topics in the entry.:";
        default:
          return insight;
      }
    }
    return (
      getVariant(variant) +
      prompts.basicPrompt +
      " Diary entry: " +
      diaryEntry +
      " Details about the diary entry writer: " +
      JSON.stringify(currentUserPersona)
    );
  },
  generateTagsPrompt: (diaryEntry: string) => {
    return (
      "Please provide some tags for the following diary entry. " +
      "The tags should be short and concise. " +
      "Do not include any punctuation or special characters. " +
      "Only respond with tags that are strongly relevant to the diary entry. " +
      "Respond only with a list of separated by commas and spaces." +
      "Return a maximum of three tags." +
      "Tag list: " +
      TAGS.map((tag) => tag.content).join(", ") +
      " " +
      "Diary entry: " +
      diaryEntry
    );
  },
  summarizeText: (content: string): string => {
    return (
      "Please summarize the following diary entry, compressing the length as much as possible while maintaining the original content and meaning." +
      "Only respond with a summary of the diary entry. " +
      "Always return a response of 80 words or less." +
      "Do not mention the author or the writer of the diary entry. The summary should be absolutely as concise as possible." +
      "Return your response in the same language as the majority of the words in the text. When in doubt, use English or Japanese, if the text has more English or Japanese words." +
      "If there is no diary entry, return nothing. " +
      "Diary entry: " +
      content
    );
  },
  generateUserPersonaPrompt: (
    persona: Persona | NewPersonaUser,
    diaryEntry: string,
  ) => {
    return (
      "For the following person (persona object) and diary entry written by that person, return an updated object persona object. " +
      "If the values are empty, update them to reflect any relevant information in the diary entry. " +
      "If there is relevant information that is substantially different in the diary entry, they can be updated, but only if the changes are accurate and appropriate. " +
      "Prefer appending new details over replacing values that are still accurate and appropriate." +
      "For example, if the person's occupation has changed, you could update the occupation key value to replace the old value with their new occupation. " +
      "The description value is general purpose and should be a short and concise summary of the person's personal goals, preferences, and aspirations. " +
      "In the relationship value, be sure to include the name and relationship with any family members, colleagues, or friends that were mentioned in a diary entry.. " +
      "For example: Natsumi's husband, Lina's father, Nick's brother, Athol's son, Brian's friend, Taro's coworker, and so on " +
      "Do not include more than 15 people at any time. Prioritize family members if length is constrained. " +
      "The traits values should be a list of comma separated descriptors that are short and concise, reflecting the person's personality traits, preferences, morals, and values. " +
      "Do not include any punctuation or special characters in any of the values." +
      "Only respond with the updated object and never change the keys. " +
      "If there is no text in the diary entry, return the same persona object with no changes." +
      "Only update values for the keys: description, occupation, relationship, and traits. All other values should be left as is." +
      "Each value should not exceed roughly 85 words total. " +
      "You are writing not for the user, but for an AI to read later. Compress the length as much as possible while maintaining the original content and meaning." +
      "Return JSON. " +
      "Persona object: " +
      JSON.stringify(persona) +
      " " +
      "Diary entry text: " +
      diaryEntry
    );
  },
};
