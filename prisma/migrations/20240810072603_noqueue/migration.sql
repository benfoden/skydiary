/*
  Warnings:

  - You are about to drop the column `ageIV` on the `Persona` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
