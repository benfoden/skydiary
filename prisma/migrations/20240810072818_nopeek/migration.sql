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
    "stripeCustomerId" TEXT,
    "isWorkFocused" BOOLEAN NOT NULL DEFAULT false,
    "commentsUsed" INTEGER,
    "personasUsed" INTEGER,
    "memoryUsed" INTEGER,
    "resetAt" DATETIME,
    "passwordSalt" TEXT,
    "sukMdk" TEXT,
    "isNoPeekingMode" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("commentsUsed", "email", "emailVerified", "id", "image", "isAdmin", "isSpecial", "isWorkFocused", "memoryUsed", "name", "passwordSalt", "personasUsed", "resetAt", "stripeCustomerId", "stripeProductId", "stripeSubscriptionId", "stripeSubscriptionStatus", "sukMdk") SELECT "commentsUsed", "email", "emailVerified", "id", "image", "isAdmin", "isSpecial", "isWorkFocused", "memoryUsed", "name", "passwordSalt", "personasUsed", "resetAt", "stripeCustomerId", "stripeProductId", "stripeSubscriptionId", "stripeSubscriptionStatus", "sukMdk" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
