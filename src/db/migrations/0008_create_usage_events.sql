CREATE TABLE "usage_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" uuid,
	"message_id" uuid,
	"provider" varchar(50) NOT NULL,
	"model" varchar(120) NOT NULL,
	"operation_type" varchar(80) NOT NULL,
	"modality" varchar(40) NOT NULL,
	"input_units" integer,
	"output_units" integer,
	"duration_ms" integer DEFAULT 0 NOT NULL,
	"estimated_cost" numeric(12, 6),
	"credits_assigned" integer,
	"status" varchar(30) NOT NULL,
	"correlation_id" varchar(120) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "usage_events_user_created_idx" ON "usage_events" USING btree ("user_id","created_at");
--> statement-breakpoint
CREATE INDEX "usage_events_session_idx" ON "usage_events" USING btree ("session_id");
--> statement-breakpoint
CREATE INDEX "usage_events_provider_model_idx" ON "usage_events" USING btree ("provider","model");
--> statement-breakpoint
CREATE INDEX "usage_events_correlation_idx" ON "usage_events" USING btree ("correlation_id");
