-- CreateTable
CREATE TABLE "AppConfig" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'main',
    "registrationsOpen" BOOLEAN NOT NULL DEFAULT true
);
