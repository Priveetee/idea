/*
  Warnings:

  - Made the column `fingerprint` on table `IdeaReaction` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_IdeaReaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ideaId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IdeaReaction_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_IdeaReaction" ("createdAt", "emoji", "fingerprint", "id", "ideaId") SELECT "createdAt", "emoji", "fingerprint", "id", "ideaId" FROM "IdeaReaction";
DROP TABLE "IdeaReaction";
ALTER TABLE "new_IdeaReaction" RENAME TO "IdeaReaction";
CREATE UNIQUE INDEX "IdeaReaction_ideaId_emoji_fingerprint_key" ON "IdeaReaction"("ideaId", "emoji", "fingerprint");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
