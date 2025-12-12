/*
  Warnings:

  - A unique constraint covering the columns `[ideaId,emoji,fingerprint]` on the table `IdeaReaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "IdeaReaction_ideaId_emoji_fingerprint_key" ON "IdeaReaction"("ideaId", "emoji", "fingerprint");
