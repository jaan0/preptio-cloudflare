-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'student',
    "studentRole" TEXT NOT NULL DEFAULT 'unpaid',
    "avatar" TEXT NOT NULL DEFAULT '/avatars/boy_1.png',
    "avatar_id" TEXT,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "adminOtpFailedAttempts" INTEGER NOT NULL DEFAULT 0,
    "degree" TEXT NOT NULL DEFAULT '',
    "level" TEXT NOT NULL DEFAULT '',
    "enrollmentType" TEXT NOT NULL DEFAULT 'institute',
    "institute" TEXT,
    "city" TEXT,
    "studentId" TEXT,
    "cenNumber" TEXT,
    "phone" TEXT,
    "instituteRating" INTEGER,
    "termsAcceptedAt" DATETIME,
    "examName" TEXT NOT NULL DEFAULT '',
    "examDate" DATETIME,
    "dailyQuestionGoal" INTEGER NOT NULL DEFAULT 0,
    "prepChecklist" JSONB,
    "practiceStreakCurrent" INTEGER NOT NULL DEFAULT 0,
    "practiceStreakBest" INTEGER NOT NULL DEFAULT 0,
    "practiceStreakLastDate" DATETIME,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" DATETIME,
    "referralCode" TEXT,
    "referralLink" TEXT,
    "popupDismissed" BOOLEAN NOT NULL DEFAULT false,
    "admin_permissions" JSONB,
    "ads_free_until" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "chapters" JSONB,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Upload" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "count" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject" TEXT NOT NULL,
    "chapter" TEXT,
    "questionNumber" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "imageUrl" TEXT,
    "options" TEXT NOT NULL,
    "optionImageUrls" TEXT NOT NULL DEFAULT '',
    "correctAnswer" INTEGER,
    "correctAnswers" TEXT NOT NULL DEFAULT '',
    "allowMultiple" BOOLEAN NOT NULL DEFAULT false,
    "maxSelections" INTEGER NOT NULL DEFAULT 2,
    "explanation" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "uploadId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TestResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "subject" TEXT NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "wrongAnswers" INTEGER NOT NULL DEFAULT 0,
    "notAttempted" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "weightedScore" REAL,
    "weightedTotal" REAL,
    "weightedPercent" REAL,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "answers" JSONB,
    "duration" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BaeMockSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "testType" TEXT NOT NULL DEFAULT 'bae_mock',
    "subjectIds" JSONB NOT NULL,
    "chapter_breakdown" JSONB,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "totalQuestions" INTEGER NOT NULL,
    "timeAllowed" INTEGER NOT NULL,
    "timeTaken" INTEGER,
    "vol1Count" INTEGER NOT NULL,
    "vol2Count" INTEGER NOT NULL,
    "vol1Correct" INTEGER NOT NULL DEFAULT 0,
    "vol2Correct" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "wrongAnswers" INTEGER NOT NULL DEFAULT 0,
    "notAttempted" INTEGER NOT NULL DEFAULT 0,
    "scorePercent" INTEGER NOT NULL DEFAULT 0,
    "questionSet" JSONB NOT NULL,
    "answers" JSONB,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MockTestQuestionHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "mockTestId" TEXT NOT NULL,
    "answeredCorrectly" BOOLEAN NOT NULL,
    "seenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MockTestQuestionHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MockTestQuestionHistory_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "userAgent" TEXT,
    "screenResolution" TEXT,
    "ip" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "platform_stats_daily" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "day_key" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'PKT',
    "period_start" DATETIME NOT NULL,
    "period_end" DATETIME NOT NULL,
    "user_count" INTEGER NOT NULL DEFAULT 0,
    "total_tests" INTEGER NOT NULL DEFAULT 0,
    "total_questions" INTEGER NOT NULL DEFAULT 0,
    "overall_accuracy" REAL NOT NULL DEFAULT 0,
    "avg_questions_per_day" REAL NOT NULL DEFAULT 0,
    "avg_streak" REAL NOT NULL DEFAULT 0,
    "avg_time_per_question" REAL NOT NULL DEFAULT 0,
    "subject_averages" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_recommendations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "range_key" TEXT NOT NULL DEFAULT 'all',
    "recommendations" JSONB NOT NULL,
    "generated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "reply" TEXT,
    "replyAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EmailSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "sendAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "sentAt" DATETIME,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "newWithinDays" INTEGER NOT NULL DEFAULT 1,
    "activeWithinDays" INTEGER NOT NULL DEFAULT 7,
    "inactiveDays" INTEGER NOT NULL DEFAULT 14,
    "examDaysBefore" INTEGER NOT NULL DEFAULT 30,
    "specificEmails" TEXT,
    "lastError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmailSchedule_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EmailTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "email_campaign_recipients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schedule_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "sent_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "email_campaign_recipients_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "EmailSchedule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Flashcard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subject" TEXT,
    "chapter" TEXT,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subject" TEXT,
    "chapter" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Otp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "purpose" TEXT NOT NULL DEFAULT 'super_admin',
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "endpoint" TEXT NOT NULL,
    "subscription" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "push_notification_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "day_key" TEXT NOT NULL,
    "sent_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "activation_email_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "step" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "error" TEXT,
    "sent_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "JoinUsRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "institute" TEXT,
    "role" TEXT,
    "experience" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "adminReply" TEXT,
    "repliedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ReviewSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "stageIndex" INTEGER NOT NULL DEFAULT 0,
    "correctStreak" INTEGER NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "nextReviewAt" DATETIME NOT NULL,
    "lastReviewedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ReviewNotificationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "lastSentAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "QuestionReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL DEFAULT '',
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT,
    "questionNumber" INTEGER,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "adminReply" TEXT,
    "repliedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,
    "focusMode" TEXT NOT NULL DEFAULT 'pomodoro',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isMaintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "adsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "welcomeMessageTemplate" TEXT NOT NULL DEFAULT 'Welcome back, {{name}}!',
    "adContent" JSONB,
    "testSettings" JSONB,
    "subscription_settings" JSONB,
    "active_avatar_pack_id" TEXT,
    "toggledBy" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SystemSettings_active_avatar_pack_id_fkey" FOREIGN KEY ("active_avatar_pack_id") REFERENCES "avatar_packs" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "institute_suggestions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "suggested_name" TEXT NOT NULL,
    "normalized_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requested_by_user_id" TEXT,
    "requested_by_email" TEXT,
    "requested_by_name" TEXT,
    "usage_count" INTEGER NOT NULL DEFAULT 1,
    "reviewed_by" TEXT,
    "review_note" TEXT,
    "reviewed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "avatar_packs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'dicebear',
    "dicebear_style" TEXT NOT NULL,
    "variants_count" INTEGER NOT NULL DEFAULT 20,
    "seeds" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FinancialStatementCase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "caseNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "trialBalancePdfUrl" TEXT NOT NULL,
    "additionalInfo" TEXT,
    "defaultTimeLimit" INTEGER NOT NULL DEFAULT 45,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "showThousandsNote" BOOLEAN NOT NULL DEFAULT false,
    "totalMarks" REAL NOT NULL DEFAULT 20.00,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SociLineItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "caseId" INTEGER NOT NULL,
    "heading" TEXT NOT NULL,
    "inputType" TEXT NOT NULL DEFAULT 'dropdown',
    "dropdownOptions" JSONB NOT NULL,
    "correctValue" TEXT NOT NULL,
    "marks" REAL NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SociLineItem_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "FinancialStatementCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SofpLineItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "caseId" INTEGER NOT NULL,
    "heading" TEXT NOT NULL,
    "inputType" TEXT NOT NULL DEFAULT 'dropdown',
    "groupLabel" TEXT,
    "dropdownOptions" JSONB NOT NULL,
    "correctValue" TEXT NOT NULL,
    "marks" REAL NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SofpLineItem_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "FinancialStatementCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FinancialStatementAttempt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "caseId" INTEGER NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "sociAnswers" JSONB NOT NULL,
    "sofpAnswers" JSONB NOT NULL,
    "totalMarksObtained" REAL NOT NULL,
    "totalMarks" REAL NOT NULL DEFAULT 20.00,
    "percentageScore" REAL NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "timeLimitSet" INTEGER NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "submittedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FinancialStatementAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FinancialStatementAttempt_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "FinancialStatementCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserFsProgress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "averageScore" REAL NOT NULL DEFAULT 0.00,
    "bestScore" REAL NOT NULL DEFAULT 0.00,
    "casesCompleted" JSONB NOT NULL DEFAULT [],
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserFsProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FinancialStatementReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" INTEGER NOT NULL,
    "lineItemId" INTEGER,
    "section" TEXT NOT NULL,
    "heading" TEXT,
    "caseNumber" TEXT,
    "caseTitle" TEXT,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FinancialStatementReport_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "FinancialStatementCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FinancialStatementReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT NOT NULL,
    "actorEmail" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "metadata" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ip_activity_log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ip_address" TEXT NOT NULL,
    "activity_type" TEXT NOT NULL,
    "target_user_id" TEXT,
    "target_endpoint" TEXT,
    "attempted_email" TEXT,
    "attempts_count" INTEGER NOT NULL DEFAULT 1,
    "first_seen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'suspicious',
    "is_reviewed" BOOLEAN NOT NULL DEFAULT false,
    "reviewed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "blocked_ips" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ip_address" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "blocked_by" TEXT NOT NULL,
    "blocked_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "block_source" TEXT NOT NULL DEFAULT 'admin',
    "total_attempts_before_block" INTEGER NOT NULL DEFAULT 0,
    "is_subnet" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "whitelisted_ips" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ip_address" TEXT NOT NULL,
    "label" TEXT,
    "added_by" TEXT NOT NULL,
    "added_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ip_security_audit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "admin_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "reason" TEXT,
    "performed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB
);

-- CreateTable
CREATE TABLE "UserFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "community_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "community_categories_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "community_threads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "edited_at" DATETIME,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "post_type" TEXT NOT NULL DEFAULT 'discussion',
    "solved_at" DATETIME,
    "accepted_comment_id" TEXT,
    "pinned_at" DATETIME,
    CONSTRAINT "community_threads_accepted_comment_id_fkey" FOREIGN KEY ("accepted_comment_id") REFERENCES "community_comments" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "community_threads_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "community_categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "community_threads_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "community_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "thread_id" TEXT NOT NULL,
    "parent_comment_id" TEXT,
    "author_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "edited_at" DATETIME,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "community_comments_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "community_threads" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "community_comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "community_comments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "community_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "community_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mime_type" TEXT NOT NULL,
    "data" BLOB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "community_bookmarks" (
    "user_id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("user_id", "thread_id"),
    CONSTRAINT "community_bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "community_bookmarks_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "community_threads" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "community_follows" (
    "user_id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("user_id", "thread_id"),
    CONSTRAINT "community_follows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "community_follows_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "community_threads" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "community_preferences" (
    "user_id" TEXT NOT NULL PRIMARY KEY,
    "replies" BOOLEAN NOT NULL DEFAULT true,
    "followed" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "community_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "community_notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "read_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "community_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "community_notifications_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "community_notifications_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "community_threads" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "community_notifications_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "community_comments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "community_votes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "community_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "community_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "community_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "community_moderation_actions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actor_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "community_moderation_actions_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "streak_audit_log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "credited_date" DATETIME NOT NULL,
    "credited" BOOLEAN NOT NULL,
    "action_type" TEXT NOT NULL,
    "streak_before" INTEGER NOT NULL DEFAULT 0,
    "streak_after" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "streak_audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "badge_type" TEXT NOT NULL,
    "earned_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "blog_authors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "avatar_url" TEXT,
    "designation" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "blog_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#16a34a',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "cover_image_url" TEXT,
    "author_id" TEXT NOT NULL,
    "author_type" TEXT NOT NULL DEFAULT 'admin',
    "category_id" TEXT NOT NULL,
    "tags" JSONB,
    "related_subjects" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "visibility" TEXT NOT NULL DEFAULT 'beta',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "reading_time" INTEGER NOT NULL DEFAULT 1,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "published_at" DATETIME,
    "scheduled_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "blog_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "blog_authors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "blog_posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "blog_categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "blog_revisions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "post_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "cover_image_url" TEXT,
    "saved_by" TEXT NOT NULL,
    "save_type" TEXT NOT NULL,
    "revision_number" INTEGER NOT NULL,
    "word_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "blog_revisions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "blog_cta_clicks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "post_id" TEXT NOT NULL,
    "subject_code" TEXT NOT NULL,
    "cta_position" TEXT NOT NULL,
    "clicked_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    "session_id" TEXT NOT NULL,
    CONSTRAINT "blog_cta_clicks_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "blog_analytics_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "post_id" TEXT,
    "event_type" TEXT NOT NULL,
    "subject_code" TEXT,
    "cta_position" TEXT,
    "share_platform" TEXT,
    "user_id" TEXT,
    "session_id" TEXT NOT NULL,
    "referrer_source" TEXT NOT NULL DEFAULT 'other',
    "time_on_page" INTEGER,
    "scroll_depth" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "blog_analytics_events_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReferralSignup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referralCode" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "newUserId" TEXT NOT NULL,
    "newUserName" TEXT NOT NULL,
    "newUserEmail" TEXT NOT NULL,
    "signedUpAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "page" TEXT,
    CONSTRAINT "ReferralSignup_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReferralSignup_newUserId_fkey" FOREIGN KEY ("newUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "student_notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "student_id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "student_notes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "student_tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "student_id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    CONSTRAINT "student_tags_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "subscription_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "payment_proof_url" TEXT NOT NULL,
    "payment_method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "approved_by" TEXT,
    "approved_at" DATETIME,
    "ads_free_until" DATETIME,
    "additional_info" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "subscription_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_name" TEXT NOT NULL,
    "account_title" TEXT,
    "account_number_or_id" TEXT,
    "additional_info" JSONB,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "system_settings_id" TEXT,
    CONSTRAINT "payment_methods_system_settings_id_fkey" FOREIGN KEY ("system_settings_id") REFERENCES "SystemSettings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "planTier" TEXT NOT NULL DEFAULT 'starter',
    "maxSeats" INTEGER NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "contactEmail" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "organization_memberships" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "org_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joined_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consented_at" DATETIME,
    CONSTRAINT "organization_memberships_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "organization_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "organization_subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "org_id" TEXT NOT NULL,
    "planTier" TEXT NOT NULL DEFAULT 'starter',
    "seats" INTEGER NOT NULL DEFAULT 30,
    "valid_from" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" DATETIME,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "organization_subscriptions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "organization_invites" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "org_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "token_hash" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "accepted_at" DATETIME,
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "organization_invites_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_cenNumber_key" ON "User"("cenNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_code_key" ON "Subject"("code");

-- CreateIndex
CREATE INDEX "Question_subject_chapter_idx" ON "Question"("subject", "chapter");

-- CreateIndex
CREATE INDEX "TestResult_userId_createdAt_idx" ON "TestResult"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "TestResult_userId_subject_createdAt_idx" ON "TestResult"("userId", "subject", "createdAt");

-- CreateIndex
CREATE INDEX "BaeMockSession_userId_completed_createdAt_idx" ON "BaeMockSession"("userId", "completed", "createdAt");

-- CreateIndex
CREATE INDEX "BaeMockSession_testType_completed_createdAt_idx" ON "BaeMockSession"("testType", "completed", "createdAt");

-- CreateIndex
CREATE INDEX "MockTestQuestionHistory_userId_questionId_idx" ON "MockTestQuestionHistory"("userId", "questionId");

-- CreateIndex
CREATE INDEX "MockTestQuestionHistory_userId_seenAt_idx" ON "MockTestQuestionHistory"("userId", "seenAt");

-- CreateIndex
CREATE UNIQUE INDEX "MockTestQuestionHistory_userId_questionId_mockTestId_key" ON "MockTestQuestionHistory"("userId", "questionId", "mockTestId");

-- CreateIndex
CREATE UNIQUE INDEX "platform_stats_daily_day_key_key" ON "platform_stats_daily"("day_key");

-- CreateIndex
CREATE INDEX "platform_stats_daily_period_start_idx" ON "platform_stats_daily"("period_start");

-- CreateIndex
CREATE INDEX "user_recommendations_expires_at_idx" ON "user_recommendations"("expires_at");

-- CreateIndex
CREATE INDEX "user_recommendations_user_id_expires_at_idx" ON "user_recommendations"("user_id", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_recommendations_user_id_range_key_key" ON "user_recommendations"("user_id", "range_key");

-- CreateIndex
CREATE INDEX "email_campaign_recipients_schedule_id_status_idx" ON "email_campaign_recipients"("schedule_id", "status");

-- CreateIndex
CREATE INDEX "email_campaign_recipients_status_sent_at_idx" ON "email_campaign_recipients"("status", "sent_at");

-- CreateIndex
CREATE UNIQUE INDEX "email_campaign_recipients_schedule_id_email_key" ON "email_campaign_recipients"("schedule_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "push_notification_logs_kind_sent_at_idx" ON "push_notification_logs"("kind", "sent_at");

-- CreateIndex
CREATE UNIQUE INDEX "push_notification_logs_userId_kind_day_key_key" ON "push_notification_logs"("userId", "kind", "day_key");

-- CreateIndex
CREATE INDEX "activation_email_logs_status_sent_at_idx" ON "activation_email_logs"("status", "sent_at");

-- CreateIndex
CREATE UNIQUE INDEX "activation_email_logs_user_id_step_key" ON "activation_email_logs"("user_id", "step");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewSchedule_userId_questionId_key" ON "ReviewSchedule"("userId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewNotificationLog_userId_key" ON "ReviewNotificationLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "institute_suggestions_normalized_name_key" ON "institute_suggestions"("normalized_name");

-- CreateIndex
CREATE INDEX "institute_suggestions_status_created_at_idx" ON "institute_suggestions"("status", "created_at");

-- CreateIndex
CREATE INDEX "institute_suggestions_usage_count_idx" ON "institute_suggestions"("usage_count");

-- CreateIndex
CREATE INDEX "avatar_packs_is_active_idx" ON "avatar_packs"("is_active");

-- CreateIndex
CREATE INDEX "avatar_packs_source_idx" ON "avatar_packs"("source");

-- CreateIndex
CREATE INDEX "avatar_packs_created_at_idx" ON "avatar_packs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialStatementCase_caseNumber_key" ON "FinancialStatementCase"("caseNumber");

-- CreateIndex
CREATE INDEX "SociLineItem_caseId_idx" ON "SociLineItem"("caseId");

-- CreateIndex
CREATE INDEX "SociLineItem_displayOrder_idx" ON "SociLineItem"("displayOrder");

-- CreateIndex
CREATE INDEX "SofpLineItem_caseId_idx" ON "SofpLineItem"("caseId");

-- CreateIndex
CREATE INDEX "SofpLineItem_displayOrder_idx" ON "SofpLineItem"("displayOrder");

-- CreateIndex
CREATE INDEX "FinancialStatementAttempt_userId_idx" ON "FinancialStatementAttempt"("userId");

-- CreateIndex
CREATE INDEX "FinancialStatementAttempt_caseId_idx" ON "FinancialStatementAttempt"("caseId");

-- CreateIndex
CREATE INDEX "FinancialStatementAttempt_submittedAt_idx" ON "FinancialStatementAttempt"("submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserFsProgress_userId_key" ON "UserFsProgress"("userId");

-- CreateIndex
CREATE INDEX "FinancialStatementReport_caseId_idx" ON "FinancialStatementReport"("caseId");

-- CreateIndex
CREATE INDEX "FinancialStatementReport_status_idx" ON "FinancialStatementReport"("status");

-- CreateIndex
CREATE INDEX "FinancialStatementReport_userId_idx" ON "FinancialStatementReport"("userId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_actorId_createdAt_idx" ON "AdminAuditLog"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_action_createdAt_idx" ON "AdminAuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "ip_activity_log_ip_address_idx" ON "ip_activity_log"("ip_address");

-- CreateIndex
CREATE INDEX "ip_activity_log_created_at_idx" ON "ip_activity_log"("created_at");

-- CreateIndex
CREATE INDEX "ip_activity_log_status_idx" ON "ip_activity_log"("status");

-- CreateIndex
CREATE INDEX "ip_activity_log_activity_type_created_at_idx" ON "ip_activity_log"("activity_type", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "blocked_ips_ip_address_key" ON "blocked_ips"("ip_address");

-- CreateIndex
CREATE INDEX "blocked_ips_ip_address_idx" ON "blocked_ips"("ip_address");

-- CreateIndex
CREATE INDEX "blocked_ips_blocked_at_idx" ON "blocked_ips"("blocked_at");

-- CreateIndex
CREATE INDEX "blocked_ips_is_active_blocked_at_idx" ON "blocked_ips"("is_active", "blocked_at");

-- CreateIndex
CREATE INDEX "blocked_ips_created_at_idx" ON "blocked_ips"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "whitelisted_ips_ip_address_key" ON "whitelisted_ips"("ip_address");

-- CreateIndex
CREATE INDEX "whitelisted_ips_ip_address_idx" ON "whitelisted_ips"("ip_address");

-- CreateIndex
CREATE INDEX "whitelisted_ips_added_at_idx" ON "whitelisted_ips"("added_at");

-- CreateIndex
CREATE INDEX "whitelisted_ips_created_at_idx" ON "whitelisted_ips"("created_at");

-- CreateIndex
CREATE INDEX "ip_security_audit_ip_address_idx" ON "ip_security_audit"("ip_address");

-- CreateIndex
CREATE INDEX "ip_security_audit_performed_at_idx" ON "ip_security_audit"("performed_at");

-- CreateIndex
CREATE INDEX "ip_security_audit_admin_id_performed_at_idx" ON "ip_security_audit"("admin_id", "performed_at");

-- CreateIndex
CREATE INDEX "ip_security_audit_created_at_idx" ON "ip_security_audit"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "UserFeedback_userId_key" ON "UserFeedback"("userId");

-- CreateIndex
CREATE INDEX "UserFeedback_createdAt_idx" ON "UserFeedback"("createdAt");

-- CreateIndex
CREATE INDEX "UserFeedback_status_createdAt_idx" ON "UserFeedback"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "community_categories_slug_key" ON "community_categories"("slug");

-- CreateIndex
CREATE INDEX "community_categories_display_order_idx" ON "community_categories"("display_order");

-- CreateIndex
CREATE UNIQUE INDEX "community_threads_accepted_comment_id_key" ON "community_threads"("accepted_comment_id");

-- CreateIndex
CREATE INDEX "community_threads_category_id_created_at_idx" ON "community_threads"("category_id", "created_at");

-- CreateIndex
CREATE INDEX "community_threads_created_at_idx" ON "community_threads"("created_at");

-- CreateIndex
CREATE INDEX "community_threads_deleted_locked_idx" ON "community_threads"("deleted", "locked");

-- CreateIndex
CREATE INDEX "community_comments_thread_id_created_at_idx" ON "community_comments"("thread_id", "created_at");

-- CreateIndex
CREATE INDEX "community_comments_parent_comment_id_created_at_idx" ON "community_comments"("parent_comment_id", "created_at");

-- CreateIndex
CREATE INDEX "community_bookmarks_user_id_created_at_idx" ON "community_bookmarks"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "community_bookmarks_thread_id_idx" ON "community_bookmarks"("thread_id");

-- CreateIndex
CREATE INDEX "community_follows_thread_id_idx" ON "community_follows"("thread_id");

-- CreateIndex
CREATE INDEX "community_notifications_user_id_read_at_created_at_idx" ON "community_notifications"("user_id", "read_at", "created_at");

-- CreateIndex
CREATE INDEX "community_notifications_thread_id_idx" ON "community_notifications"("thread_id");

-- CreateIndex
CREATE INDEX "community_notifications_actor_id_idx" ON "community_notifications"("actor_id");

-- CreateIndex
CREATE INDEX "community_notifications_comment_id_idx" ON "community_notifications"("comment_id");

-- CreateIndex
CREATE UNIQUE INDEX "community_notifications_user_id_comment_id_kind_key" ON "community_notifications"("user_id", "comment_id", "kind");

-- CreateIndex
CREATE INDEX "community_votes_target_type_target_id_idx" ON "community_votes"("target_type", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "community_votes_user_id_target_type_target_id_key" ON "community_votes"("user_id", "target_type", "target_id");

-- CreateIndex
CREATE INDEX "community_reports_status_created_at_idx" ON "community_reports"("status", "created_at");

-- CreateIndex
CREATE INDEX "community_reports_target_type_target_id_idx" ON "community_reports"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "community_moderation_actions_created_at_idx" ON "community_moderation_actions"("created_at");

-- CreateIndex
CREATE INDEX "community_moderation_actions_target_type_target_id_idx" ON "community_moderation_actions"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "streak_audit_log_user_id_idx" ON "streak_audit_log"("user_id");

-- CreateIndex
CREATE INDEX "streak_audit_log_user_id_credited_date_idx" ON "streak_audit_log"("user_id", "credited_date");

-- CreateIndex
CREATE INDEX "streak_audit_log_created_at_idx" ON "streak_audit_log"("created_at");

-- CreateIndex
CREATE INDEX "streak_audit_log_action_type_created_at_idx" ON "streak_audit_log"("action_type", "created_at");

-- CreateIndex
CREATE INDEX "user_badges_user_id_idx" ON "user_badges"("user_id");

-- CreateIndex
CREATE INDEX "user_badges_seen_created_at_idx" ON "user_badges"("seen", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_user_id_badge_type_key" ON "user_badges"("user_id", "badge_type");

-- CreateIndex
CREATE INDEX "blog_authors_created_at_idx" ON "blog_authors"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "blog_categories_slug_key" ON "blog_categories"("slug");

-- CreateIndex
CREATE INDEX "blog_categories_created_at_idx" ON "blog_categories"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_status_published_at_idx" ON "blog_posts"("status", "published_at");

-- CreateIndex
CREATE INDEX "blog_posts_category_id_idx" ON "blog_posts"("category_id");

-- CreateIndex
CREATE INDEX "blog_posts_featured_idx" ON "blog_posts"("featured");

-- CreateIndex
CREATE INDEX "blog_posts_visibility_idx" ON "blog_posts"("visibility");

-- CreateIndex
CREATE INDEX "blog_posts_scheduled_at_idx" ON "blog_posts"("scheduled_at");

-- CreateIndex
CREATE INDEX "blog_posts_created_at_idx" ON "blog_posts"("created_at");

-- CreateIndex
CREATE INDEX "blog_revisions_post_id_created_at_idx" ON "blog_revisions"("post_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "blog_revisions_post_id_revision_number_key" ON "blog_revisions"("post_id", "revision_number");

-- CreateIndex
CREATE INDEX "blog_cta_clicks_post_id_idx" ON "blog_cta_clicks"("post_id");

-- CreateIndex
CREATE INDEX "blog_cta_clicks_subject_code_idx" ON "blog_cta_clicks"("subject_code");

-- CreateIndex
CREATE INDEX "blog_cta_clicks_clicked_at_idx" ON "blog_cta_clicks"("clicked_at");

-- CreateIndex
CREATE INDEX "blog_cta_clicks_session_id_idx" ON "blog_cta_clicks"("session_id");

-- CreateIndex
CREATE INDEX "blog_analytics_events_post_id_idx" ON "blog_analytics_events"("post_id");

-- CreateIndex
CREATE INDEX "blog_analytics_events_event_type_idx" ON "blog_analytics_events"("event_type");

-- CreateIndex
CREATE INDEX "blog_analytics_events_created_at_idx" ON "blog_analytics_events"("created_at");

-- CreateIndex
CREATE INDEX "blog_analytics_events_session_id_idx" ON "blog_analytics_events"("session_id");

-- CreateIndex
CREATE INDEX "blog_analytics_events_post_id_created_at_idx" ON "blog_analytics_events"("post_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralSignup_newUserId_key" ON "ReferralSignup"("newUserId");

-- CreateIndex
CREATE INDEX "ReferralSignup_referralCode_idx" ON "ReferralSignup"("referralCode");

-- CreateIndex
CREATE INDEX "ReferralSignup_referrerId_idx" ON "ReferralSignup"("referrerId");

-- CreateIndex
CREATE INDEX "ReferralSignup_signedUpAt_idx" ON "ReferralSignup"("signedUpAt");

-- CreateIndex
CREATE INDEX "student_notes_student_id_created_at_idx" ON "student_notes"("student_id", "created_at");

-- CreateIndex
CREATE INDEX "student_tags_student_id_idx" ON "student_tags"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_tags_student_id_tag_key" ON "student_tags"("student_id", "tag");

-- CreateIndex
CREATE INDEX "subscription_requests_user_id_status_idx" ON "subscription_requests"("user_id", "status");

-- CreateIndex
CREATE INDEX "subscription_requests_status_created_at_idx" ON "subscription_requests"("status", "created_at");

-- CreateIndex
CREATE INDEX "subscription_requests_created_at_idx" ON "subscription_requests"("created_at");

-- CreateIndex
CREATE INDEX "payment_methods_type_is_active_idx" ON "payment_methods"("type", "is_active");

-- CreateIndex
CREATE INDEX "payment_methods_display_order_idx" ON "payment_methods"("display_order");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_name_key" ON "organizations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_isActive_idx" ON "organizations"("isActive");

-- CreateIndex
CREATE INDEX "organizations_created_at_idx" ON "organizations"("created_at");

-- CreateIndex
CREATE INDEX "organization_memberships_user_id_idx" ON "organization_memberships"("user_id");

-- CreateIndex
CREATE INDEX "organization_memberships_org_id_idx" ON "organization_memberships"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_memberships_org_id_user_id_key" ON "organization_memberships"("org_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_subscriptions_org_id_key" ON "organization_subscriptions"("org_id");

-- CreateIndex
CREATE INDEX "organization_subscriptions_is_active_idx" ON "organization_subscriptions"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "organization_invites_token_hash_key" ON "organization_invites"("token_hash");

-- CreateIndex
CREATE INDEX "organization_invites_org_id_idx" ON "organization_invites"("org_id");

-- CreateIndex
CREATE INDEX "organization_invites_expires_at_idx" ON "organization_invites"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "organization_invites_org_id_email_key" ON "organization_invites"("org_id", "email");
