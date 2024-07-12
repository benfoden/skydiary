import { ServerClient } from "postmark";
import { env } from "~/env";

export const postmarkClient = new ServerClient(env.POSTMARK_API_KEY);
