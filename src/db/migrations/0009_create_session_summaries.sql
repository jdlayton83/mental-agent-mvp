CREATE TABLE "session_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"summary" text NOT NULL,
	"main_topic" text,
	"key_points" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"decisions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"next_steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"memory_candidates" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"safety_summary" text,
	"provider" varchar(50) NOT NULL,
	"model" varchar(120) NOT NULL,
	"prompt_version_id" uuid,
	"status" varchar(30) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "session_summaries" ADD CONSTRAINT "session_summaries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "session_summaries" ADD CONSTRAINT "session_summaries_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "session_summaries_session_unique" ON "session_summaries" USING btree ("session_id");
--> statement-breakpoint
CREATE INDEX "session_summaries_user_created_idx" ON "session_summaries" USING btree ("user_id","created_at");
--> statement-breakpoint
CREATE INDEX "session_summaries_status_idx" ON "session_summaries" USING btree ("status");
