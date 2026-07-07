"use client";

import { useActionState, useState, useTransition } from "react";
import Image from "next/image";
import {
  AtSign,
  Check,
  Clock,
  ImagePlus,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Star,
  Trash2,
  X,
} from "lucide-react";
import {
  updateTalent,
  updateMeasurements,
  addPortfolioImage,
  removePortfolioImage,
  setPortfolioStatus,
  deactivateTalent,
} from "@/lib/actions/talent";
import { dateShort, statusLabel } from "@/lib/format";
import { StatusPill, accentText } from "@/components/admin/kit";
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
const STATUSES = ["active", "inactive", "suspended", "exited"];
const ASSET_STATUSES = ["current", "needs_update", "missing"];
const IMAGE_TYPES = [
  "polaroid",
  "comp_card",
  "digital",
  "editorial",
  "commercial",
  "test_shoot",
];

function talentAccent(status) {
  if (status === "active") return "success";
  if (status === "suspended") return "warning";
  if (status === "exited") return "destructive";
  return "muted";
}

function assetAccent(v) {
  if (v === "current") return "success";
  if (v === "needs_update") return "warning";
  return "destructive";
}

function SectionHead({ label, meta }) {
  return (
    <div className="flex items-baseline justify-between pb-3">
      <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
        {label}
      </div>
      {meta && (
        <span className="font-mono text-[10px] text-muted-foreground/70">{meta}</span>
      )}
    </div>
  );
}

export function TalentDetail({ talent: t, analytics, viewerRole }) {
  const primaryImage =
    t.portfolioImages?.find((img) => img.is_primary_polaroid)?.image_url ||
    t.polaroid_url;

  return (
    <div>
      <div className="mt-6 flex items-baseline justify-between pb-2">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          Roster · {statusLabel(t.category)}
        </div>
        <div className="font-mono text-[11px] text-muted-foreground">ID · {t.id.slice(0, 8)}</div>
      </div>

      <div className="grid grid-cols-12 items-start gap-x-6 border-b border-border/60 pb-8">
        <div className="col-span-2">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={`${t.first_name} ${t.last_name}`}
              width={80}
              height={80}
              unoptimized
              className="h-20 w-20 rounded-full object-cover ring-1 ring-border/60"
            />
          ) : (
            <span className="grid h-20 w-20 place-items-center rounded-full bg-muted/60 font-serif text-[26px] font-light italic text-foreground ring-1 ring-border/60">
              {t.first_name?.[0]}
              {t.last_name?.[0]}
            </span>
          )}
        </div>
        <div className="col-span-7">
          <h1 className="font-serif text-[44px] font-light leading-[1.02] tracking-[-0.02em] text-foreground">
            {t.first_name} <span className="editorial-italic">{t.last_name}</span>
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              {statusLabel(t.primary_location)}
              {t.secondary_location ? ` · ${statusLabel(t.secondary_location)}` : ""}
            </span>
            {t.instagram_handle && (
              <span className="inline-flex items-center gap-1.5">
                <AtSign className="h-3 w-3" />
                {t.instagram_handle.replace(/^@/, "")}
              </span>
            )}
            <span>Joined {dateShort(t.created_at)}</span>
          </div>
          {t.bio && (
            <p className="mt-3 max-w-[64ch] font-serif text-[14px] font-light italic leading-relaxed text-muted-foreground">
              {t.bio}
            </p>
          )}
        </div>
        <div className="col-span-3 text-right">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
            Status
          </div>
          <div className="mt-1">
            <StatusPill status={t.status} accent={talentAccent(t.status)} className="text-[12px]" />
          </div>
          <div className="mt-3 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
            Public roster
          </div>
          <div className="mt-1 text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
            {t.is_public ? "Visible" : "Hidden"}
          </div>
          <div className="mt-3 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
            Commission
          </div>
          <div
            data-slot="numeric"
            className="mt-1 font-serif text-[24px] font-light text-foreground"
          >
            {Number(t.commission_rate)}%
          </div>
        </div>
      </div>

      <section className="mt-10 grid grid-cols-2 gap-8 border-b border-border/60 pb-8 md:grid-cols-4">
        <MiniStat label="Bookings" value={t.counts?.bookings ?? 0} />
        <MiniStat label="Payments" value={t.counts?.payments ?? 0} />
        <MiniStat label="Documents" value={t.counts?.documents ?? 0} />
        {analytics ? (
          <MiniStat
            label="Casting selection"
            value={`${analytics.selection_rate_pct ?? 0}%`}
            sub={`${analytics.interests_count} interests · ${analytics.selected_count} selected`}
          />
        ) : (
          <MiniStat label="Portfolio images" value={t.portfolioImages?.length ?? 0} />
        )}
      </section>

      <ProfileSection talent={t} />
      <MeasurementsSection talent={t} />
      <PortfolioSection talent={t} />
      <PortfolioStatusSection talent={t} />
      <AccountSection talent={t} viewerRole={viewerRole} />
    </div>
  );
}

function MiniStat({ label, value, sub }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70">
        {label}
      </div>
      <div
        data-slot="numeric"
        className="mt-2 font-serif text-[26px] font-light leading-none tracking-[-0.02em] text-foreground"
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function EditToggle({ editing, onStart, onCancel }) {
  return editing ? (
    <button
      type="button"
      onClick={onCancel}
      className="pressable inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
    >
      <X className="h-3 w-3" />
      Cancel
    </button>
  ) : (
    <button
      type="button"
      onClick={onStart}
      className="pressable inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
    >
      <Pencil className="h-3 w-3" />
      Edit
    </button>
  );
}

function SavedFlash({ show }) {
  if (!show) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10.5px] uppercase tracking-[0.14em] text-success">
      <Check className="h-3 w-3" />
      Saved — reflected on the talent dashboard
    </span>
  );
}

// ---------------------------------------------------------------------------
// Profile (updateTalent)
// ---------------------------------------------------------------------------

function ProfileSection({ talent: t }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(async (prev, formData) => {
    const result = await updateTalent(prev, formData);
    if (result?.success) setEditing(false);
    return result;
  }, undefined);

  const daysToContractEnd = t.contract_end_date
    ? Math.ceil(
        (new Date(`${t.contract_end_date}T00:00:00`) - new Date()) / 86400000
      )
    : null;

  return (
    <section className="mt-10 border-b border-border/60 pb-10">
      <div className="flex items-baseline justify-between pb-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          Profile &amp; contract
        </div>
        <div className="flex items-center gap-3">
          <SavedFlash show={state?.success && !editing} />
          <EditToggle
            editing={editing}
            onStart={() => setEditing(true)}
            onCancel={() => setEditing(false)}
          />
        </div>
      </div>

      {!editing ? (
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
              Contact
            </div>
            <ul className="mt-3 space-y-2 text-[12.5px]">
              <li className="flex items-center gap-2 text-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                {t.account?.email || "No login yet"}
              </li>
              <li className="flex items-center gap-2 text-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                {t.phone || "—"}
              </li>
              <li className="flex items-center gap-2 text-foreground">
                <AtSign className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                {t.instagram_handle || "—"}
              </li>
            </ul>
          </div>
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
              Contract
            </div>
            <div className="mt-3 space-y-2 text-[12.5px]">
              <Row label="Type" value={statusLabel(t.contract_type)} />
              <Row label="Exclusivity" value={statusLabel(t.exclusivity)} />
              <Row label="Start" value={dateShort(t.contract_start_date)} mono />
              <Row label="End" value={dateShort(t.contract_end_date)} mono />
              <Row label="Commission" value={`${Number(t.commission_rate)}%`} serif />
              {daysToContractEnd !== null &&
                daysToContractEnd <= 60 &&
                daysToContractEnd > 0 && (
                  <div className="inline-flex items-center gap-1 text-[10.5px] uppercase tracking-[0.14em] text-warning">
                    <Clock className="h-3 w-3" />
                    Renews in {daysToContractEnd}d
                  </div>
                )}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
              Placement
            </div>
            <div className="mt-3 space-y-2 text-[12.5px]">
              <Row label="Category" value={statusLabel(t.category)} />
              <Row label="Status" value={statusLabel(t.status)} />
              <Row label="Primary" value={statusLabel(t.primary_location)} />
              <Row
                label="Secondary"
                value={t.secondary_location ? statusLabel(t.secondary_location) : "—"}
              />
              <Row label="Public roster" value={t.is_public ? "Visible" : "Hidden"} />
              <Row label="Date of birth" value={dateShort(t.date_of_birth)} mono />
            </div>
          </div>
        </div>
      ) : (
        <form action={action} className="space-y-4">
          <input type="hidden" name="id" value={t.id} />
          <FormError error={state?.error} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="First name">
              <input name="firstName" defaultValue={t.first_name} className={inputClass} />
            </Field>
            <Field label="Last name">
              <input name="lastName" defaultValue={t.last_name} className={inputClass} />
            </Field>
            <Field label="Category">
              <select name="category" defaultValue={t.category} className={inputClass}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {statusLabel(c)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select name="status" defaultValue={t.status} className={inputClass}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Primary location">
              <select
                name="primaryLocation"
                defaultValue={t.primary_location}
                className={inputClass}
              >
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {statusLabel(l)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Secondary location">
              <select
                name="secondaryLocation"
                defaultValue={t.secondary_location || ""}
                className={inputClass}
              >
                <option value="">None</option>
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {statusLabel(l)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Phone">
              <input name="phone" defaultValue={t.phone || ""} className={inputClass} />
            </Field>
            <Field label="Instagram">
              <input
                name="instagramHandle"
                defaultValue={t.instagram_handle || ""}
                className={inputClass}
              />
            </Field>
            <Field label="Date of birth">
              <input
                name="dateOfBirth"
                type="date"
                defaultValue={t.date_of_birth || ""}
                className={inputClass}
              />
            </Field>
            <Field label="Exclusivity">
              <select name="exclusivity" defaultValue={t.exclusivity} className={inputClass}>
                <option value="non_exclusive">Non-exclusive</option>
                <option value="exclusive">Exclusive</option>
              </select>
            </Field>
            <Field label="Contract type">
              <select name="contractType" defaultValue={t.contract_type} className={inputClass}>
                <option value="full_management">Full management</option>
                <option value="welcome_agreement">Welcome agreement</option>
              </select>
            </Field>
            <Field label="Commission %">
              <input
                name="commissionRate"
                type="number"
                step="0.5"
                min="0"
                max="100"
                defaultValue={Number(t.commission_rate)}
                className={inputClass}
              />
            </Field>
            <Field label="Contract start">
              <input
                name="contractStartDate"
                type="date"
                defaultValue={t.contract_start_date || ""}
                className={inputClass}
              />
            </Field>
            <Field label="Contract end">
              <input
                name="contractEndDate"
                type="date"
                defaultValue={t.contract_end_date || ""}
                className={inputClass}
              />
            </Field>
            <Field label="Public roster">
              <select name="isPublic" defaultValue={String(t.is_public)} className={inputClass}>
                <option value="true">Visible</option>
                <option value="false">Hidden</option>
              </select>
            </Field>
          </div>
          <Field label="Bio">
            <textarea
              name="bio"
              rows={3}
              defaultValue={t.bio || ""}
              className={`${inputClass} resize-none`}
            />
          </Field>
          <div className="flex justify-end">
            <SubmitButton pending={pending}>
              {pending ? "Saving…" : "Save profile"}
            </SubmitButton>
          </div>
        </form>
      )}
    </section>
  );
}

function Row({ label, value, mono, serif }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          serif
            ? "font-serif text-[18px] font-light text-foreground"
            : mono
              ? "font-mono text-[11px] text-foreground"
              : "text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Measurements (updateMeasurements)
// ---------------------------------------------------------------------------

const MEASUREMENT_FIELDS = [
  ["heightCm", "Height (cm)", "height_cm"],
  ["heightDisplay", "Height (display)", "height_display"],
  ["bust", "Bust", "bust"],
  ["waist", "Waist", "waist"],
  ["hips", "Hips", "hips"],
  ["shoeUk", "Shoe (UK)", "shoe_uk"],
  ["shoeEu", "Shoe (EU)", "shoe_eu"],
  ["hairColour", "Hair colour", "hair_colour"],
  ["eyeColour", "Eye colour", "eye_colour"],
  ["dressSize", "Dress size", "dress_size"],
];

function MeasurementsSection({ talent: t }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(async (prev, formData) => {
    const result = await updateMeasurements(prev, formData);
    if (result?.success) setEditing(false);
    return result;
  }, undefined);
  const m = t.measurements || {};

  return (
    <section className="mt-10 border-b border-border/60 pb-10">
      <div className="flex items-baseline justify-between pb-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          Measurements
        </div>
        <div className="flex items-center gap-3">
          <SavedFlash show={state?.success && !editing} />
          <EditToggle
            editing={editing}
            onStart={() => setEditing(true)}
            onCancel={() => setEditing(false)}
          />
        </div>
      </div>

      {!editing ? (
        <ol className="divide-y divide-border/60 border-y border-border/60">
          {MEASUREMENT_FIELDS.map(([, label, col], i) => (
            <li key={col} className="py-2.5">
              <div className="grid grid-cols-12 items-baseline gap-x-4">
                <div className="col-span-1 font-mono text-[10px] text-muted-foreground/60">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="col-span-5 text-[12.5px] uppercase tracking-[0.1em] text-muted-foreground">
                  {label}
                </div>
                <div
                  data-slot="numeric"
                  className="col-span-6 text-right font-serif text-[17px] font-light text-foreground"
                >
                  {m[col] ?? "—"}
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <form action={action} className="space-y-4">
          <input type="hidden" name="talentId" value={t.id} />
          <FormError error={state?.error} />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {MEASUREMENT_FIELDS.map(([name, label, col]) => (
              <Field key={name} label={label}>
                <input name={name} defaultValue={m[col] ?? ""} className={inputClass} />
              </Field>
            ))}
          </div>
          <div className="flex justify-end">
            <SubmitButton pending={pending}>
              {pending ? "Saving…" : "Save measurements"}
            </SubmitButton>
          </div>
        </form>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Portfolio images (add by URL / remove / set primary)
// ---------------------------------------------------------------------------

function PortfolioSection({ talent: t }) {
  const [state, action, pending] = useActionState(addPortfolioImage, undefined);
  const [busyId, setBusyId] = useState(null);
  const [rowError, setRowError] = useState(null);
  const [, startTransition] = useTransition();
  const images = t.portfolioImages || [];

  function handleRemove(imageId) {
    setRowError(null);
    setBusyId(imageId);
    startTransition(async () => {
      const result = await removePortfolioImage(imageId);
      if (result?.error) setRowError(result.error);
      setBusyId(null);
    });
  }

  // The data layer has no "set primary" action for an existing image, so we
  // re-add the same URL as primary (which un-primaries the rest) and remove
  // the old row.
  function handleSetPrimary(img) {
    setRowError(null);
    setBusyId(img.id);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("talentId", t.id);
      fd.set("imageUrl", img.image_url);
      fd.set("imageType", img.image_type);
      fd.set("isPrimaryPolaroid", "true");
      fd.set("sortOrder", String(img.sort_order ?? 0));
      const added = await addPortfolioImage(undefined, fd);
      if (added?.error) {
        setRowError(added.error);
      } else {
        const removed = await removePortfolioImage(img.id);
        if (removed?.error) setRowError(removed.error);
      }
      setBusyId(null);
    });
  }

  return (
    <section className="mt-10 border-b border-border/60 pb-10">
      <SectionHead label="Portfolio images" meta={`${images.length} on file`} />

      {rowError && <FormError error={rowError} />}

      {images.length === 0 ? (
        <p className="py-4 text-[12px] text-muted-foreground">
          No images yet — add the first one by URL below.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {images.map((img) => (
            <li
              key={img.id}
              className="group relative overflow-hidden rounded-sm border border-border/60 bg-muted/30"
            >
              <Image
                src={img.image_url}
                alt={statusLabel(img.image_type)}
                width={200}
                height={260}
                unoptimized
                className="aspect-[3/4] w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-background/85 px-2 py-1.5 backdrop-blur-sm">
                <span className="truncate text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground">
                  {statusLabel(img.image_type)}
                </span>
                <span className="flex items-center gap-1">
                  {img.is_primary_polaroid ? (
                    <span title="Primary polaroid" className="text-bronze">
                      <Star className="h-3.5 w-3.5 fill-current" />
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={busyId === img.id}
                      onClick={() => handleSetPrimary(img)}
                      title="Make primary polaroid"
                      className="pressable text-muted-foreground transition-colors hover:text-bronze disabled:opacity-50"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busyId === img.id}
                    onClick={() => handleRemove(img.id)}
                    title="Remove image"
                    className="pressable text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form action={action} className="mt-6 space-y-3">
        <input type="hidden" name="talentId" value={t.id} />
        <FormError error={state?.error} />
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Image URL" className="min-w-[280px] flex-1">
            <input
              name="imageUrl"
              type="url"
              required
              placeholder="https://…"
              className={inputClass}
            />
          </Field>
          <Field label="Type">
            <select name="imageType" defaultValue="editorial" className={inputClass}>
              {IMAGE_TYPES.map((it) => (
                <option key={it} value={it}>
                  {statusLabel(it)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sort">
            <input
              name="sortOrder"
              type="number"
              defaultValue={images.length}
              className={`${inputClass} w-20`}
            />
          </Field>
          <label className="flex h-9 items-center gap-2 text-[11.5px] text-muted-foreground">
            <input type="checkbox" name="isPrimaryPolaroid" value="true" />
            Primary polaroid
          </label>
          <SubmitButton pending={pending}>
            <ImagePlus className="h-3.5 w-3.5" />
            {pending ? "Adding…" : "Add image"}
          </SubmitButton>
        </div>
      </form>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Portfolio status (setPortfolioStatus)
// ---------------------------------------------------------------------------

function PortfolioStatusSection({ talent: t }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(async (prev, formData) => {
    const result = await setPortfolioStatus(prev, formData);
    if (result?.success) setEditing(false);
    return result;
  }, undefined);

  return (
    <section className="mt-10 border-b border-border/60 pb-10">
      <div className="flex items-baseline justify-between pb-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          Portfolio status
        </div>
        <div className="flex items-center gap-3">
          <SavedFlash show={state?.success && !editing} />
          <EditToggle
            editing={editing}
            onStart={() => setEditing(true)}
            onCancel={() => setEditing(false)}
          />
        </div>
      </div>

      {!editing ? (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div>
            <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
              Comp card
            </div>
            <div
              className={`mt-1 text-[12.5px] uppercase tracking-[0.1em] ${accentText(assetAccent(t.comp_card_status))}`}
            >
              {statusLabel(t.comp_card_status)}
            </div>
          </div>
          <div>
            <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
              Digitals
            </div>
            <div
              className={`mt-1 text-[12.5px] uppercase tracking-[0.1em] ${accentText(assetAccent(t.digitals_status))}`}
            >
              {statusLabel(t.digitals_status)}
            </div>
          </div>
          <div>
            <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
              Last test shoot
            </div>
            <div className="mt-1 font-mono text-[11px] text-foreground">
              {dateShort(t.last_test_shoot)}
            </div>
          </div>
          <div>
            <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
              Next shoot
            </div>
            <div className="mt-1 font-mono text-[11px] text-foreground">
              {dateShort(t.next_scheduled_shoot)}
            </div>
          </div>
          {t.portfolio_notes && (
            <p className="col-span-full text-[12px] leading-relaxed text-muted-foreground">
              {t.portfolio_notes}
            </p>
          )}
        </div>
      ) : (
        <form action={action} className="space-y-4">
          <input type="hidden" name="talentId" value={t.id} />
          <FormError error={state?.error} />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Field label="Comp card">
              <select
                name="compCardStatus"
                defaultValue={t.comp_card_status}
                className={inputClass}
              >
                {ASSET_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Digitals">
              <select
                name="digitalsStatus"
                defaultValue={t.digitals_status}
                className={inputClass}
              >
                {ASSET_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Last test shoot">
              <input
                name="lastTestShoot"
                type="date"
                defaultValue={t.last_test_shoot || ""}
                className={inputClass}
              />
            </Field>
            <Field label="Next scheduled shoot">
              <input
                name="nextScheduledShoot"
                type="date"
                defaultValue={t.next_scheduled_shoot || ""}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Notes">
            <textarea
              name="portfolioNotes"
              rows={2}
              defaultValue={t.portfolio_notes || ""}
              className={`${inputClass} resize-none`}
            />
          </Field>
          <div className="flex justify-end">
            <SubmitButton pending={pending}>
              {pending ? "Saving…" : "Save status"}
            </SubmitButton>
          </div>
        </form>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Account (read-only, deactivate for CEO)
// ---------------------------------------------------------------------------

function AccountSection({ talent: t, viewerRole }) {
  const [pendingDeactivate, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const account = t.account;

  return (
    <section className="mt-10">
      <SectionHead
        label="Account"
        meta={account ? (account.is_active ? "Login active" : "Login disabled") : "No login"}
      />
      {error && <FormError error={error} />}
      {!account ? (
        <p className="py-4 text-[12px] text-muted-foreground">
          This talent has no linked login yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div>
            <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
              Email
            </div>
            <div className="mt-1 truncate text-[12.5px] text-foreground">{account.email}</div>
          </div>
          <div>
            <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
              Name on account
            </div>
            <div className="mt-1 text-[12.5px] text-foreground">{account.full_name}</div>
          </div>
          <div>
            <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
              Last login
            </div>
            <div className="mt-1 font-mono text-[11px] text-foreground">
              {account.last_login ? dateShort(account.last_login) : "Never"}
            </div>
          </div>
          <div className="text-right md:text-left">
            <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
              Access
            </div>
            <div className="mt-1">
              <StatusPill
                status={account.is_active ? "active" : "inactive"}
                accent={account.is_active ? "success" : "muted"}
              />
            </div>
          </div>
        </div>
      )}

      {viewerRole === "ceo" && t.status !== "inactive" && (
        <div className="mt-6 border-t border-border/60 pt-5">
          <button
            type="button"
            disabled={pendingDeactivate}
            onClick={() => {
              if (!confirm(`Deactivate ${t.first_name} ${t.last_name}? This disables their login and removes them from the public roster.`)) return;
              setError(null);
              startTransition(async () => {
                const result = await deactivateTalent(t.id);
                if (result?.error) setError(result.error);
              });
            }}
            className="pressable inline-flex h-8 items-center gap-1.5 rounded-full border border-destructive/40 px-3 text-[10.5px] font-medium uppercase tracking-[0.14em] text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-60"
          >
            {pendingDeactivate ? "Deactivating…" : "Deactivate talent"}
          </button>
          <span className="ml-3 text-[11px] text-muted-foreground">
            CEO only — sets status inactive and disables the login.
          </span>
        </div>
      )}
    </section>
  );
}
