CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"conversation_id" uuid,
	"guided_mode_id" uuid,
	"session_type" varchar(50) NOT NULL,
	"status" varchar(30) NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"paused_at" timestamp with time zone,
	"last_activity_at" timestamp with time zone DEFAULT now() NOT NULL,
	"active_duration_seconds" integer DEFAULT 0 NOT NULL,
	"total_duration_seconds" integer DEFAULT 0 NOT NULL,
	"base_credit_cost" integer DEFAULT 0 NOT NULL,
	"included_user_messages" integer DEFAULT 0 NOT NULL,
	"extra_credit_cost" integer DEFAULT 0 NOT NULL,
	"total_credit_cost" integer DEFAULT 0 NOT NULL,
	"estimated_technical_cost" numeric(12, 6),
	"risk_level" integer DEFAULT 0 NOT NULL,
	"private_mode" boolean DEFAULT false NOT NULL,
	"pricing_rule_version" varchar(120),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "session_id" uuid;
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "sessions_user_status_idx" ON "sessions" USING btree ("user_id","status");
--> statement-breakpoint
CREATE INDEX "sessions_user_activity_idx" ON "sessions" USING btree ("user_id","last_activity_at");
--> statement-breakpoint
CREATE INDEX "sessions_conversation_idx" ON "sessions" USING btree ("conversation_id");
--> statement-breakpoint
CREATE INDEX "messages_session_idx" ON "messages" USING btree ("session_id");
