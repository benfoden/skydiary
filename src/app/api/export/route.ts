import { type NextRequest } from "next/server";
import { env } from "~/env";
import { api } from "~/trpc/server";

export async function POST(req: NextRequest) {
  let userData: {
    exportUser: {
      name: string | null;
      email: string | null;
      image: string | null;
    };
    exportPersonas: {
      id: string;
      name: string;
      description: string | null;
      gender: string | null;
      occupation: string | null;
      relationship: string | null;
      traits: string;
      communicationSample: string | null;
      communicationStyle: string | null;
    }[];
    exportPosts: {
      content: string;
      updatedAt: Date;
      createdAt: Date;
      id: string;
    }[];
  } | null = null;

  const body = (await req.json()) as {
    userId: string;
  };

  try {
    const user = await api.user.getByIdAsCron({
      userId: body.userId,
      cronSecret: env.CRON_SECRET,
    });

    if (!user) {
      return Response.json({ userData: null, status: 404 });
    }
    const exportUser = {
      name: user.name,
      email: user.email,
      image: user.image,
    };

    const personas = await api.persona.getAllAiPersonasByUserIdAsCron({
      userId: body.userId,
      cronSecret: env.CRON_SECRET,
    });

    const exportPersonas = personas.map((persona) => ({
      id: persona.id,
      name: persona.name,
      description: persona.description,
      gender: persona.gender,
      occupation: persona.occupation,
      relationship: persona.relationship,
      traits: persona.traits,
      communicationSample: persona.communicationSample,
      communicationStyle: persona.communicationStyle,
    }));

    const posts = await api.post.getAllByUserIdAsCron({
      userId: body.userId,
      cronSecret: env.CRON_SECRET,
    });

    const exportPosts = posts.map((post) => ({
      content: post.content,
      updatedAt: post.updatedAt,
      createdAt: post.createdAt,
      id: post.id,
    }));

    userData = {
      exportUser,
      exportPersonas,
      exportPosts,
    };

    Response.json({ userData, status: 200 });
  } catch (error) {
    Response.json({
      userData: null,
      status: 500,
      error: "Error exporting data",
    });
  }
}
