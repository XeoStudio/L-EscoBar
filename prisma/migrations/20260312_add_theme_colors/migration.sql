-- Add advanced theme color customization fields
ALTER TABLE "settings"
ADD COLUMN "accentColor" TEXT NOT NULL DEFAULT '#D4A574',
ADD COLUMN "backgroundColor" TEXT NOT NULL DEFAULT '#FDF8F3',
ADD COLUMN "surfaceColor" TEXT NOT NULL DEFAULT '#FFFFFF',
ADD COLUMN "textPrimaryColor" TEXT NOT NULL DEFAULT '#3D2314';
