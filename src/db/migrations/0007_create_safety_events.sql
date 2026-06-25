CREATE TABLE "safety_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" uuid,
	"message_id" uuid,
	"category" varchar(80) NOT NULL,
	"risk_level" integer NOT NULL,
	"trigger_summary" text NOT NULL,
	"classifier" varchar(120) NOT NULL,
	"policy" varchar(120) NOT NULL,
	"action" varchar(80) NOT NULL,
	"status" varchar(30) NOT NULL,
	"correlation_id" varchar(120) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "safety_events" ADD CONSTRAINT "safety_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "safety_events" ADD CONSTRAINT "safety_events_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "safety_events" ADD CONSTRAINT "safety_events_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "safety_events_user_created_idx" ON "safety_events" USING btree ("user_id","created_at");
--> statement-breakpoint
CREATE INDEX "safety_events_user_level_idx" ON "safety_events" USING btree ("user_id","risk_level");
--> statement-breakpoint
CREATE INDEX "safety_events_session_idx" ON "safety_events" USING btree ("session_id");
