-- CreateTable
CREATE TABLE "mindmap_folders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mindmap_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mindmaps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "folderId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'general',
    "nodes" JSONB NOT NULL DEFAULT '[]',
    "edges" JSONB NOT NULL DEFAULT '[]',
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mindmaps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mindmap_folders_userId_idx" ON "mindmap_folders"("userId");

-- CreateIndex
CREATE INDEX "mindmaps_userId_idx" ON "mindmaps"("userId");

-- CreateIndex
CREATE INDEX "mindmaps_userId_folderId_idx" ON "mindmaps"("userId", "folderId");

-- CreateIndex
CREATE INDEX "mindmaps_userId_type_idx" ON "mindmaps"("userId", "type");

-- AddForeignKey
ALTER TABLE "mindmap_folders" ADD CONSTRAINT "mindmap_folders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mindmaps" ADD CONSTRAINT "mindmaps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mindmaps" ADD CONSTRAINT "mindmaps_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "mindmap_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
