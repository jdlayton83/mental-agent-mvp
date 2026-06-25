CREATE TABLE "guided_modes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(80) NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"session_type" varchar(50) NOT NULL,
	"base_credit_cost" integer DEFAULT 0 NOT NULL,
	"included_user_messages" integer DEFAULT 0 NOT NULL,
	"prompt_version_id" uuid,
	"flow_definition" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_guided_mode_id_guided_modes_id_fk" FOREIGN KEY ("guided_mode_id") REFERENCES "public"."guided_modes"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "guided_modes_code_unique" ON "guided_modes" USING btree ("code");
