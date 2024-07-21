-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "value" TEXT,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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
    "resetAt" DATETIME
);
INSERT INTO "new_User" ("commentsUsed", "email", "emailVerified", "id", "image", "isAdmin", "isSpecial", "memoryUsed", "name", "personasUsed", "resetAt", "stripeCustomerId", "stripeProductId", "stripeSubscriptionId", "stripeSubscriptionStatus") SELECT "commentsUsed", "email", "emailVerified", "id", "image", "isAdmin", "isSpecial", "memoryUsed", "name", "personasUsed", "resetAt", "stripeCustomerId", "stripeProductId", "stripeSubscriptionId", "stripeSubscriptionStatus" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
