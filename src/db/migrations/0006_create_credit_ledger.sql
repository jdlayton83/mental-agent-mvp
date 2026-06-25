CREATE TABLE "credit_wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"available_balance" integer DEFAULT 0 NOT NULL,
	"reserved_balance" integer DEFAULT 0 NOT NULL,
	"status" varchar(30) NOT NULL,
	"lock_version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" uuid,
	"transaction_type" varchar(50) NOT NULL,
	"amount" integer NOT NULL,
	"available_before" integer NOT NULL,
	"available_after" integer NOT NULL,
	"reserved_before" integer NOT NULL,
	"reserved_after" integer NOT NULL,
	"reason" text NOT NULL,
	"source" varchar(80) NOT NULL,
	"idempotency_key" varchar(160),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"wallet_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"reserved_amount" integer NOT NULL,
	"consumed_amount" integer DEFAULT 0 NOT NULL,
	"released_amount" integer DEFAULT 0 NOT NULL,
	"status" varchar(30) NOT NULL,
	"idempotency_key" varchar(160) NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "credit_wallets" ADD CONSTRAINT "credit_wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_wallet_id_credit_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."credit_wallets"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "session_reservations" ADD CONSTRAINT "session_reservations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "session_reservations" ADD CONSTRAINT "session_reservations_wallet_id_credit_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."credit_wallets"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "session_reservations" ADD CONSTRAINT "session_reservations_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "credit_wallets_user_id_unique" ON "credit_wallets" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "credit_wallets_user_status_idx" ON "credit_wallets" USING btree ("user_id","status");
--> statement-breakpoint
CREATE UNIQUE INDEX "credit_transactions_idempotency_key_unique" ON "credit_transactions" USING btree ("idempotency_key");
--> statement-breakpoint
CREATE INDEX "credit_transactions_wallet_created_idx" ON "credit_transactions" USING btree ("wallet_id","created_at");
--> statement-breakpoint
CREATE INDEX "credit_transactions_user_created_idx" ON "credit_transactions" USING btree ("user_id","created_at");
--> statement-breakpoint
CREATE UNIQUE INDEX "session_reservations_session_id_unique" ON "session_reservations" USING btree ("session_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "session_reservations_idempotency_key_unique" ON "session_reservations" USING btree ("idempotency_key");
--> statement-breakpoint
CREATE INDEX "session_reservations_user_status_idx" ON "session_reservations" USING btree ("user_id","status");
