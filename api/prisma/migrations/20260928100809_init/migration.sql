-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('M', 'M2', 'M3', 'KG', 'PIECE');

-- CreateTable
CREATE TABLE "Article" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "parentId" INTEGER,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrawingObject" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "unit" "Unit" NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "articleId" INTEGER NOT NULL,

    CONSTRAINT "DrawingObject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_code_key" ON "Article"("code");

-- CreateIndex
CREATE INDEX "Article_parentId_idx" ON "Article"("parentId");

-- CreateIndex
CREATE INDEX "DrawingObject_articleId_idx" ON "DrawingObject"("articleId");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawingObject" ADD CONSTRAINT "DrawingObject_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
