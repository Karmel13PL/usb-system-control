-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('online', 'offline', 'unknown');

-- CreateEnum
CREATE TYPE "UsbPolicyMode" AS ENUM ('allow_all', 'block_all', 'whitelist_only');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('device_registered', 'heartbeat_received', 'usb_inserted', 'usb_allowed', 'usb_blocked', 'policy_changed', 'policy_applied');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'admin',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" UUID NOT NULL,
    "hostname" VARCHAR(255) NOT NULL,
    "agent_token" VARCHAR(255) NOT NULL,
    "status" "DeviceStatus" NOT NULL DEFAULT 'unknown',
    "policy_mode" "UsbPolicyMode" NOT NULL DEFAULT 'whitelist_only',
    "agent_version" VARCHAR(50),
    "os_version" VARCHAR(100),
    "last_ip_address" VARCHAR(45),
    "last_mac_address" VARCHAR(17),
    "last_logged_in_user" VARCHAR(255),
    "last_domain" VARCHAR(255),
    "last_reported_usb_blocked" BOOLEAN NOT NULL DEFAULT false,
    "device_fingerprint" VARCHAR(255),
    "last_seen_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usb_whitelist" (
    "id" UUID NOT NULL,
    "serial_number" VARCHAR(255) NOT NULL,
    "vendor" VARCHAR(255),
    "product_name" VARCHAR(255),
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "usb_whitelist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_usb_assignments" (
    "id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "usb_whitelist_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_usb_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "event_type" "EventType" NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "occurred_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(100) NOT NULL,
    "entity_id" UUID,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "devices_agent_token_key" ON "devices"("agent_token");

-- CreateIndex
CREATE INDEX "devices_status_idx" ON "devices"("status");

-- CreateIndex
CREATE INDEX "devices_last_seen_at_idx" ON "devices"("last_seen_at");

-- CreateIndex
CREATE INDEX "devices_hostname_idx" ON "devices"("hostname");

-- CreateIndex
CREATE INDEX "devices_device_fingerprint_idx" ON "devices"("device_fingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "usb_whitelist_serial_number_key" ON "usb_whitelist"("serial_number");

-- CreateIndex
CREATE INDEX "usb_whitelist_vendor_idx" ON "usb_whitelist"("vendor");

-- CreateIndex
CREATE INDEX "device_usb_assignments_device_idx" ON "device_usb_assignments"("device_id");

-- CreateIndex
CREATE INDEX "device_usb_assignments_usb_idx" ON "device_usb_assignments"("usb_whitelist_id");

-- CreateIndex
CREATE UNIQUE INDEX "device_usb_assignments_device_usb_uq" ON "device_usb_assignments"("device_id", "usb_whitelist_id");

-- CreateIndex
CREATE INDEX "events_device_id_idx" ON "events"("device_id");

-- CreateIndex
CREATE INDEX "events_event_type_idx" ON "events"("event_type");

-- CreateIndex
CREATE INDEX "events_occurred_at_idx" ON "events"("occurred_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "device_usb_assignments" ADD CONSTRAINT "device_usb_assignments_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_usb_assignments" ADD CONSTRAINT "device_usb_assignments_usb_whitelist_id_fkey" FOREIGN KEY ("usb_whitelist_id") REFERENCES "usb_whitelist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
