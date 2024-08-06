/*
  Warnings:

  - You are about to drop the column `iv` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `iv` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Persona" ADD COLUMN "ageIV" TEXT;
ALTER TABLE "Persona" ADD COLUMN "communicationSampleIV" TEXT;
ALTER TABLE "Persona" ADD COLUMN "communicationStyleIV" TEXT;
ALTER TABLE "Persona" ADD COLUMN "descriptionIV" TEXT;
ALTER TABLE "Persona" ADD COLUMN "genderIV" TEXT;
ALTER TABLE "Persona" ADD COLUMN "nameIV" TEXT;
ALTER TABLE "Persona" ADD COLUMN "occupationIV" TEXT;
ALTER TABLE "Persona" ADD COLUMN "relationshipIV" TEXT;
ALTER TABLE "Persona" ADD COLUMN "traitsIV" TEXT;

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
INSERT INTO "new_Comment" ("coachName", "coachVariant", "content", "createdAt", "createdByPersonaId", "id", "isAI", "postId") SELECT "coachName", "coachVariant", "content", "createdAt", "createdByPersonaId", "id", "isAI", "postId" FROM "Comment";
DROP TABLE "Comment";
ALTER TABLE "new_Comment" RENAME TO "Comment";
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");
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
INSERT INTO "new_Post" ("content", "createdAt", "createdById", "id", "sentimentScore", "summary", "title", "updatedAt") SELECT "content", "createdAt", "createdById", "id", "sentimentScore", "summary", "title", "updatedAt" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
CREATE INDEX "Post_createdById_idx" ON "Post"("createdById");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
