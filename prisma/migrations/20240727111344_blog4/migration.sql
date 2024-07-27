/*
  Warnings:

  - A unique constraint covering the columns `[urlStub]` on the table `BlogPost` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN "urlStub" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_urlStub_key" ON "BlogPost"("urlStub");
