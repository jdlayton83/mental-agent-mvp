CREATE TABLE "agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"custom_name" varchar(120),
	"tone" varchar(50) NOT NULL,
	"response_style" varchar(50) NOT NULL,
	"initiative_level" integer NOT NULL,
	"main_goal" text,
	"topics_of_interest" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"topics_to_avoid" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" varchar(30) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_template_id_agent_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."agent_templates"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "agents_user_primary_active_unique" ON "agents" USING btree ("user_id") WHERE "agents"."is_primary" = true and "agents"."status" = 'active' and "agents"."deleted_at" is null;
