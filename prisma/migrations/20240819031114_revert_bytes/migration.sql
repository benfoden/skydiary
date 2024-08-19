/*
  Warnings:

  - You are about to drop the column `coachNameIVBytes` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `contentIVBytes` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `communicationSampleIVBytes` on the `Persona` table. All the data in the column will be lost.
  - You are about to drop the column `communicationStyleIVBytes` on the `Persona` table. All the data in the column will be lost.
  - You are about to drop the column `descriptionIVBytes` on the `Persona` table. All the data in the column will be lost.
  - You are about to drop the column `genderIVBytes` on the `Persona` table. All the data in the column will be lost.
  - You are about to drop the column `nameIVBytes` on the `Persona` table. All the data in the column will be lost.
  - You are about to drop the column `occupationIVBytes` on the `Persona` table. All the data in the column will be lost.
  - You are about to drop the column `relationshipIVBytes` on the `Persona` table. All the data in the column will be lost.
  - You are about to drop the column `traitsIVBytes` on the `Persona` table. All the data in the column will be lost.
  - You are about to drop the column `contentIVBytes` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `summaryIVBytes` on the `Post` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "contentIV" TEXT,
    "isAI" BOOLEAN NOT NULL DEFAULT true,
    "createdByPersonaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coachVariant" TEXT,
    "coachName" TEXT,
    "coachNameIV" TEXT,
    "postId" TEXT NOT NULL,
    CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_createdByPersonaId_fkey" FOREIGN KEY ("createdByPersonaId") REFERENCES "Persona" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Comment" ("coachName", "coachNameIV", "coachVariant", "content", "contentIV", "createdAt", "createdByPersonaId", "id", "isAI", "postId") SELECT "coachName", "coachNameIV", "coachVariant", "content", "contentIV", "createdAt", "createdByPersonaId", "id", "isAI", "postId" FROM "Comment";
DROP TABLE "Comment";
ALTER TABLE "new_Comment" RENAME TO "Comment";
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");
CREATE TABLE "new_Persona" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "image" TEXT,
    "age" INTEGER,
    "name" TEXT NOT NULL,
    "nameIV" TEXT,
    "description" TEXT,
    "descriptionIV" TEXT,
    "gender" TEXT,
    "genderIV" TEXT,
    "relationship" TEXT,
    "relationshipIV" TEXT,
    "occupation" TEXT,
    "occupationIV" TEXT,
    "traits" TEXT NOT NULL,
    "traitsIV" TEXT,
    "communicationStyle" TEXT,
    "communicationStyleIV" TEXT,
    "communicationSample" TEXT,
    "communicationSampleIV" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT NOT NULL,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isUser" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Persona_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Persona" ("age", "communicationSample", "communicationSampleIV", "communicationStyle", "communicationStyleIV", "createdAt", "createdById", "description", "descriptionIV", "gender", "genderIV", "id", "image", "isFavorite", "isUser", "name", "nameIV", "occupation", "occupationIV", "relationship", "relationshipIV", "traits", "traitsIV", "updatedAt") SELECT "age", "communicationSample", "communicationSampleIV", "communicationStyle", "communicationStyleIV", "createdAt", "createdById", "description", "descriptionIV", "gender", "genderIV", "id", "image", "isFavorite", "isUser", "name", "nameIV", "occupation", "occupationIV", "relationship", "relationshipIV", "traits", "traitsIV", "updatedAt" FROM "Persona";
DROP TABLE "Persona";
ALTER TABLE "new_Persona" RENAME TO "Persona";
CREATE INDEX "Persona_createdById_idx" ON "Persona"("createdById");
CREATE TABLE "new_Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "contentIV" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT NOT NULL,
    "sentimentScore" TEXT,
    "summary" TEXT,
    "summaryIV" TEXT,
    CONSTRAINT "Post_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Post" ("content", "contentIV", "createdAt", "createdById", "id", "sentimentScore", "summary", "summaryIV", "title", "updatedAt") SELECT "content", "contentIV", "createdAt", "createdById", "id", "sentimentScore", "summary", "summaryIV", "title", "updatedAt" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
CREATE INDEX "Post_createdById_idx" ON "Post"("createdById");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
