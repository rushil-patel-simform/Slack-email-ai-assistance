-- CreateTable
CREATE TABLE "SlackWorkspace" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "botUserId" TEXT NOT NULL,
    "botToken" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SlackWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlackProcessedMessage" (
    "id" TEXT NOT NULL,
    "messageTs" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "replied" BOOLEAN NOT NULL DEFAULT false,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "skipReason" TEXT,

    CONSTRAINT "SlackProcessedMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlackReplyLog" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "messageTs" TEXT NOT NULL,
    "replyTs" TEXT NOT NULL,
    "aiReplyPreview" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedMessageId" TEXT NOT NULL,

    CONSTRAINT "SlackReplyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlackSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "autoReplyEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SlackSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SlackWorkspace_teamId_key" ON "SlackWorkspace"("teamId");

-- CreateIndex
CREATE INDEX "SlackWorkspace_teamId_idx" ON "SlackWorkspace"("teamId");

-- CreateIndex
CREATE INDEX "SlackProcessedMessage_teamId_idx" ON "SlackProcessedMessage"("teamId");

-- CreateIndex
CREATE INDEX "SlackProcessedMessage_channelId_idx" ON "SlackProcessedMessage"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "SlackProcessedMessage_messageTs_channelId_key" ON "SlackProcessedMessage"("messageTs", "channelId");

-- CreateIndex
CREATE UNIQUE INDEX "SlackReplyLog_processedMessageId_key" ON "SlackReplyLog"("processedMessageId");

-- CreateIndex
CREATE INDEX "SlackReplyLog_teamId_idx" ON "SlackReplyLog"("teamId");

-- AddForeignKey
ALTER TABLE "SlackProcessedMessage" ADD CONSTRAINT "SlackProcessedMessage_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "SlackWorkspace"("teamId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlackReplyLog" ADD CONSTRAINT "SlackReplyLog_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "SlackWorkspace"("teamId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlackReplyLog" ADD CONSTRAINT "SlackReplyLog_processedMessageId_fkey" FOREIGN KEY ("processedMessageId") REFERENCES "SlackProcessedMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
