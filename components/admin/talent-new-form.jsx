"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTalent } from "@/lib/actions/talent";
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
const LOCATIONS = ["lagos", "london", "usa"];

export function TalentNewForm() {
  const [state, action, pending] = useActionState(createTalent, undefined);
  const router = useRouter();

  useEffect(() => {
    if (state?.success && state.talentId) {
      router.push(`/admin/talent/${state.talentId}`);
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-8">
      <FormError error={state?.error} />

      <section>
        <div className="border-b border-border/60 pb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          Identity
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="First name *">
            <input name="firstName" required className={inputClass} placeholder="Amara" />
          </Field>
          <Field label="Last name *">
            <input name="lastName" required className={inputClass} placeholder="Okafor" />
          </Field>
          <Field label="Email *" hint="Their login — the invite goes here.">
            <input
              name="email"
              type="email"
              required
              className={inputClass}
              placeholder="talent@example.com"
            />
          </Field>
          <Field label="Category *">
            <select name="category" required defaultValue="model" className={inputClass}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {statusLabel(c)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date of birth">
            <input name="dateOfBirth" type="date" className={inputClass} />
          </Field>
          <Field label="Phone">
            <input name="phone" className={inputClass} placeholder="+234 ..." />
          </Field>
          <Field label="Instagram handle">
            <input name="instagramHandle" className={inputClass} placeholder="@handle" />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Bio">
            <textarea
              name="bio"
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="A short editorial bio for the roster."
            />
          </Field>
        </div>
      </section>

      <section>
        <div className="border-b border-border/60 pb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          Location
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Primary location *">
            <select name="primaryLocation" required defaultValue="lagos" className={inputClass}>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {statusLabel(l)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Secondary location">
            <select name="secondaryLocation" defaultValue="" className={inputClass}>
              <option value="">None</option>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {statusLabel(l)}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section>
        <div className="border-b border-border/60 pb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          Contract
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Exclusivity">
            <select name="exclusivity" defaultValue="non_exclusive" className={inputClass}>
              <option value="non_exclusive">Non-exclusive</option>
              <option value="exclusive">Exclusive</option>
            </select>
          </Field>
          <Field label="Contract type">
            <select name="contractType" defaultValue="full_management" className={inputClass}>
              <option value="full_management">Full management</option>
              <option value="welcome_agreement">Welcome agreement</option>
            </select>
          </Field>
          <Field label="Commission rate %" hint="House default is 20%.">
            <input
              name="commissionRate"
              type="number"
              step="0.5"
              min="0"
              max="100"
              placeholder="20"
              className={inputClass}
            />
          </Field>
          <Field label="Contract start">
            <input name="contractStartDate" type="date" className={inputClass} />
          </Field>
          <Field label="Contract end">
            <input name="contractEndDate" type="date" className={inputClass} />
          </Field>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-5">
        <SubmitButton pending={pending}>
          {pending ? "Creating profile…" : "Add to roster"}
        </SubmitButton>
      </div>
    </form>
  );
}
