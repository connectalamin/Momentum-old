-- AlterTable
ALTER TABLE "assignments" ADD COLUMN     "actualHoursSpent" DOUBLE PRECISION,
ADD COLUMN     "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "currentDay" INTEGER,
ADD COLUMN     "daysAllocated" INTEGER,
ADD COLUMN     "examId" TEXT,
ADD COLUMN     "progressPercentage" DOUBLE PRECISION,
ADD COLUMN     "syllabusGenerated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "lastGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "lastGeneratedMonths" INTEGER,
ADD COLUMN     "syllabus" TEXT,
ADD COLUMN     "syllabusHash" TEXT;

-- AlterTable
ALTER TABLE "milestones" ADD COLUMN     "actualHoursSpent" DOUBLE PRECISION,
ADD COLUMN     "currentDay" INTEGER,
ADD COLUMN     "daysAllocated" INTEGER,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "estimatedHours" DOUBLE PRECISION,
ADD COLUMN     "progressPercentage" DOUBLE PRECISION,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "actualMinutesSpent" INTEGER,
ADD COLUMN     "currentDay" INTEGER,
ADD COLUMN     "daysAllocated" INTEGER,
ADD COLUMN     "progressPercentage" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "habits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "completionHistory" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "habits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_task_patterns" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "estimatedHours" DOUBLE PRECISION NOT NULL,
    "actualHours" DOUBLE PRECISION NOT NULL,
    "estimatedDays" INTEGER NOT NULL,
    "actualDays" INTEGER,
    "completionRate" DOUBLE PRECISION NOT NULL,
    "progressRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_task_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "message" TEXT NOT NULL,
    "source" TEXT,
    "action" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "habits" ADD CONSTRAINT "habits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_task_patterns" ADD CONSTRAINT "user_task_patterns_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
