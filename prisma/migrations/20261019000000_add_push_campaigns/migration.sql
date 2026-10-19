-- CreateTable
CREATE TABLE IF NOT EXISTS "push_campaigns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "url" TEXT NOT NULL DEFAULT '/dashboard',
    "icon" TEXT NOT NULL DEFAULT '/web-app-manifest-192x192.png',
    "badge" TEXT NOT NULL DEFAULT '/web-app-manifest-192x192.png',
    "segment" TEXT NOT NULL,
    "specificEmails" TEXT,
    "newWithinDays" INTEGER NOT NULL DEFAULT 1,
    "activeWithinDays" INTEGER NOT NULL DEFAULT 7,
    "inactiveDays" INTEGER NOT NULL DEFAULT 14,
    "examDaysBefore" INTEGER NOT NULL DEFAULT 30,
    "totalTargeted" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "cleanedCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "lastError" TEXT,
    "sentBy" TEXT,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "push_campaigns_createdAt_idx" ON "push_campaigns"("createdAt");
