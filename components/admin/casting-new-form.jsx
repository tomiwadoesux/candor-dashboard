"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { createCasting } from "@/lib/actions/castings";
import { statusLabel } from "@/lib/format";
import {
  Field,
  FormError,
  SubmitButton,
  inputClass,
} from "@/components/admin/form-kit";

const CATEGORIES = [
  "model",
  "photographer",
  "creative_director",
  "visual_artist",
  "artisan",
  "graphic_designer",
  "content_creator",
  "influencer",
  "brand_partner",
  "educator",
];

export function CastingNewForm({ clients = [], defaults = {} }) {
  const [state, action, pending] = useActionState(createCasting, undefined);
  const router = useRouter();

  useEffect(() => {
    if (state?.success && state.castingId) {
      router.push(`/admin/casting/${state.castingId}`);
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-8">
      <FormError error={state?.error} />

      <section>
        <div className="border-b border-border/60 pb-2 text-[11.5px] font-medium text-muted-foreground/70">
          Public brief · visible to talent
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Title *" className="md:col-span-2" hint="No brand names here.">
            <input
              name="title"
              required
              defaultValue={defaults.title}
              className={inputClass}
              placeholder="Beauty campaign — international brand"
            />
          </Field>
          <Field label="Category *">
            <select
              name="category"
              required
              defaultValue={defaults.category || "model"}
              className={inputClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {statusLabel(c)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Location *">
            <select
              name="location"
              required
              defaultValue={defaults.location || "lagos"}
              className={inputClass}
            >
              <option value="lagos">Lagos</option>
              <option value="london">London</option>
              <option value="usa_other">USA / Other</option>
            </select>
          </Field>
          <Field label="Shoot start *">
            <input
              name="shootDateStart"
              type="date"
              required
              defaultValue={defaults.shootDateStart}
              className={inputClass}
            />
          </Field>
          <Field label="Shoot end">
            <input
              name="shootDateEnd"
              type="date"
              defaultValue={defaults.shootDateEnd}
              className={inputClass}
            />
          </Field>
          <Field label="Deadline for interest *">
            <input
              name="deadline"
              type="datetime-local"
              required
              defaultValue={defaults.deadline}
              className={inputClass}
            />
          </Field>
          <Field label="Work type">
            <input
              name="workType"
              defaultValue={defaults.workType}
              className={inputClass}
              placeholder="Stills, film, runway…"
            />
          </Field>
          <Field label="Media usage" className="md:col-span-2">
            <input
              name="mediaUsage"
              defaultValue={defaults.mediaUsage}
              className={inputClass}
              placeholder="Digital + print, 12 months"
            />
          </Field>
        </div>
        <div className="mt-4 space-y-4">
          <Field label="Description">
            <textarea
              name="description"
              rows={3}
              defaultValue={defaults.description}
              className={`${inputClass} resize-none`}
              placeholder="What the job is, without naming the brand."
            />
          </Field>
          <Field label="Requirements">
            <textarea
              name="requirements"
              rows={2}
              defaultValue={defaults.requirements}
              className={`${inputClass} resize-none`}
              placeholder="Measurements, look, availability…"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-sm border border-warning/30 bg-warning/[0.04] p-5">
        <div className="flex items-center gap-2 border-b border-warning/20 pb-2 text-[11.5px] font-medium text-warning">
          <Lock className="h-3 w-3" />
          Internal only · never shown to talent
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Client">
            <select name="clientId" defaultValue="" className={inputClass}>
              <option value="">Not linked yet</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Brand name (internal)">
            <input
              name="brandNameInternal"
              defaultValue={defaults.brandNameInternal}
              className={inputClass}
              placeholder="Revealed to talent only on selection"
            />
          </Field>
        </div>
      </section>

      <div className="flex items-center justify-end border-t border-border/60 pt-5">
        <SubmitButton pending={pending}>
          {pending ? "Posting…" : "Post to the board"}
        </SubmitButton>
      </div>
    </form>
  );
}
