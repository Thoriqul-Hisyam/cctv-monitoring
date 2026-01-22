/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `cctv` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `cctv` ADD COLUMN `slug` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `cctv_slug_key` ON `cctv`(`slug`);
