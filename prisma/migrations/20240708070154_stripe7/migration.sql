-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Persona" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "relationship" TEXT,
    "occupation" TEXT,
    "traits" TEXT NOT NULL,
    "communicationStyle" TEXT,
    "communicationSample" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT NOT NULL,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isUser" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Persona_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Persona" ("age", "communicationSample", "communicationStyle", "createdAt", "createdById", "description", "gender", "id", "image", "isUser", "name", "occupation", "relationship", "traits", "updatedAt") SELECT "age", "communicationSample", "communicationStyle", "createdAt", "createdById", "description", "gender", "id", "image", "isUser", "name", "occupation", "relationship", "traits", "updatedAt" FROM "Persona";
DROP TABLE "Persona";
ALTER TABLE "new_Persona" RENAME TO "Persona";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
