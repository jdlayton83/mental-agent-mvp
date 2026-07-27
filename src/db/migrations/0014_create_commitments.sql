CREATE TABLE "commitments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"agent_id" uuid,
	"session_id" uuid,
	"title" varchar(160) NOT NULL,
	"description" text,
	"source" varchar(50) NOT NULL,
	"status" varchar(30) DEFAULT 'active' NOT NULL,
	"is_confirmed_by_user" boolean DEFAULT false NOT NULL,
	"due_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "commitments" ADD CONSTRAINT "commitments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "commitments" ADD CONSTRAINT "commitments_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "commitments" ADD CONSTRAINT "commitments_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "commitments_user_status_idx" ON "commitments" USING btree ("user_id","status");
--> statement-breakpoint
CREATE INDEX "commitments_user_due_idx" ON "commitments" USING btree ("user_id","due_at");
--> statement-breakpoint
CREATE INDEX "commitments_session_idx" ON "commitments" USING btree ("session_id");
