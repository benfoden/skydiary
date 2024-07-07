/*
  Warnings:

  - You are about to drop the column `isSubscriber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `maxCommentLength` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `maxCommentsPerDay` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `maxHistoryLength` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `maxPersonas` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "stripeCustomerId" TEXT
);
INSERT INTO "new_User" ("email", "emailVerified", "id", "image", "isAdmin", "isSpecial", "name", "stripeCustomerId", "stripeSubscriptionId", "stripeSubscriptionStatus") SELECT "email", "emailVerified", "id", "image", "isAdmin", "isSpecial", "name", "stripeCustomerId", "stripeSubscriptionId", "stripeSubscriptionStatus" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
