-- AlterTable
ALTER TABLE "Comment" ADD COLUMN "coachNameIVBytes" BLOB;
ALTER TABLE "Comment" ADD COLUMN "contentIVBytes" BLOB;

-- AlterTable
ALTER TABLE "Persona" ADD COLUMN "communicationSampleIVBytes" BLOB;
ALTER TABLE "Persona" ADD COLUMN "communicationStyleIVBytes" BLOB;
ALTER TABLE "Persona" ADD COLUMN "descriptionIVBytes" BLOB;
ALTER TABLE "Persona" ADD COLUMN "genderIVBytes" BLOB;
ALTER TABLE "Persona" ADD COLUMN "nameIVBytes" BLOB;
ALTER TABLE "Persona" ADD COLUMN "occupationIVBytes" BLOB;
ALTER TABLE "Persona" ADD COLUMN "relationshipIVBytes" BLOB;
ALTER TABLE "Persona" ADD COLUMN "traitsIVBytes" BLOB;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN "contentIVBytes" BLOB;
ALTER TABLE "Post" ADD COLUMN "summaryIVBytes" BLOB;
