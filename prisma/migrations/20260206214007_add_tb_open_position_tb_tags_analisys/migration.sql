-- CreateTable
CREATE TABLE "open_position" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "open_position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_analisys" (
    "id" TEXT NOT NULL,
    "open_position_id" TEXT NOT NULL,
    "tier_1" TEXT,
    "tier_2" TEXT,
    "tier_3" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tag_analisys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tag_analisys_open_position_id_key" ON "tag_analisys"("open_position_id");

-- AddForeignKey
ALTER TABLE "tag_analisys" ADD CONSTRAINT "tag_analisys_open_position_id_fkey" FOREIGN KEY ("open_position_id") REFERENCES "open_position"("id") ON DELETE CASCADE ON UPDATE CASCADE;
