-- Add language preference for full UI localization
ALTER TABLE "settings"
ADD COLUMN "language" TEXT NOT NULL DEFAULT 'ar';
