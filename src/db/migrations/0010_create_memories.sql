CREATE TABLE "memories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"agent_id" uuid,
	"session_id" uuid,
	"memory_type" varchar(50) NOT NULL,
	"title" varchar(160) NOT NULL,
	"content" text NOT NULL,
	"normalized_content" text NOT NULL,
	"source" varchar(50) NOT NULL,
	"status" varchar(30) NOT NULL,
	"confidence" varchar(30) NOT NULL,
	"sensitivity" varchar(30) NOT NULL,
	"relevance_score" integer DEFAULT 0 NOT NULL,
	"is_confirmed_by_user" boolean DEFAULT false NOT NULL,
	"is_available_for_retrieval" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "memories" ADD CONSTRAINT "memories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "memories" ADD CONSTRAINT "memories_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "memories" ADD CONSTRAINT "memories_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "memories_user_session_normalized_unique" ON "memories" USING btree ("user_id","session_id","normalized_content");
--> statement-breakpoint
CREATE INDEX "memories_user_status_idx" ON "memories" USING btree ("user_id","status");
--> statement-breakpoint
CREATE INDEX "memories_user_type_idx" ON "memories" USING btree ("user_id","memory_type");
--> statement-breakpoint
CREATE INDEX "memories_user_retrieval_idx" ON "memories" USING btree ("user_id","is_available_for_retrieval");
--> statement-breakpoint
CREATE INDEX "memories_session_idx" ON "memories" USING btree ("session_id");
