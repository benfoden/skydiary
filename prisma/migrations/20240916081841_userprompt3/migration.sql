-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Prompt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "tagId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "isWorkFocused" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Prompt_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Prompt_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Prompt" ("content", "createdAt", "createdById", "id", "isGlobal", "tagId", "updatedAt") SELECT "content", "createdAt", "createdById", "id", "isGlobal", "tagId", "updatedAt" FROM "Prompt";
DROP TABLE "Prompt";
ALTER TABLE "new_Prompt" RENAME TO "Prompt";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isSpecial" BOOLEAN NOT NULL DEFAULT false,
    "stripeProductId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripeSubscriptionStatus" TEXT,
    "stripeCustomerId" TEXT,
    "isWorkFocused" BOOLEAN NOT NULL DEFAULT false,
    "commentsUsed" INTEGER,
    "personasUsed" INTEGER,
    "memoryUsed" INTEGER,
    "resetAt" DATETIME,
    "passwordSalt" TEXT,
    "sukMdk" TEXT,
    "isNoPeekingMode" BOOLEAN NOT NULL DEFAULT false,
    "newAnnouncementId" TEXT,
    "referredToEmails" TEXT,
    "isPromptShown" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_User" ("commentsUsed", "email", "emailVerified", "id", "image", "isAdmin", "isNoPeekingMode", "isSpecial", "isWorkFocused", "memoryUsed", "name", "newAnnouncementId", "passwordSalt", "personasUsed", "referredToEmails", "resetAt", "stripeCustomerId", "stripeProductId", "stripeSubscriptionId", "stripeSubscriptionStatus", "sukMdk") SELECT "commentsUsed", "email", "emailVerified", "id", "image", "isAdmin", "isNoPeekingMode", "isSpecial", "isWorkFocused", "memoryUsed", "name", "newAnnouncementId", "passwordSalt", "personasUsed", "referredToEmails", "resetAt", "stripeCustomerId", "stripeProductId", "stripeSubscriptionId", "stripeSubscriptionStatus", "sukMdk" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
