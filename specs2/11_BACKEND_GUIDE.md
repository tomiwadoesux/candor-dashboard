# Backend Implementation Guide

## Setup

### 1. Initialize Project

```bash
npx create-next-app@latest candor-dashboard --typescript --tailwind --app --src-dir
cd candor-dashboard
```

### 2. Install Dependencies

```bash
# Database
npm install prisma @prisma/client
npx prisma init

# Auth
npm install bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken

# Email
npm install resend
# OR if using Nodemailer:
# npm install nodemailer
# npm install -D @types/nodemailer

# File uploads
npm install cloudinary
# OR if using S3:
# npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Data fetching (client-side)
npm install swr

# UUID generation
npm install uuid
npm install -D @types/uuid

# Date handling
npm install date-fns
```

### 3. Environment Variables

Create `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/candor_dashboard"

# Auth
JWT_SECRET="generate-a-random-64-char-string-here"
JWT_EXPIRY="7d"

# Email (Resend)
RESEND_API_KEY="re_xxx"
EMAIL_FROM="Candor Management <contact@candor-management.com>"

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME="candor"
CLOUDINARY_API_KEY="xxx"
CLOUDINARY_API_SECRET="xxx"

# AI (Hugging Face)
AI_PROVIDER="huggingface"
AI_MODEL="mistralai/Mistral-7B-Instruct-v0.3"
AI_API_URL="https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"
HF_API_KEY=""
# Leave HF_API_KEY empty for free tier, or add a token for higher rate limits

# App
NEXT_PUBLIC_APP_URL="https://dashboard.candor-management.com"
NEXT_PUBLIC_BRAND_COLOUR="#00749E"
DEFAULT_COMMISSION_RATE=20
ESCALATION_HOURS=10
```

---

## Prisma Schema

Create `prisma/schema.prisma` based on `02_DATABASE.md`. Here is the full schema:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  talent
  booker
  md
  ceo
}

enum TalentStatus {
  active
  inactive
  suspended
  exited
}

enum Exclusivity {
  exclusive
  non_exclusive
}

enum Location {
  lagos
  london
  usa
}

enum TalentCategory {
  model
  photographer
  creative_director
  visual_artist
  artisan
  graphic_designer
  content_creator
  influencer
  brand_partner
  educator
}

enum ContractType {
  welcome_agreement
  full_management
}

enum ClientType {
  new_client
  established
}

enum BookingStatus {
  casting_sent
  pending
  confirmed
  completed
  cancelled
}

enum PaymentStatus {
  awaiting_client_payment
  client_paid
  talent_paid
}

enum Currency {
  NGN
  GBP
  USD
}

enum NotificationType {
  availability_check
  booking_update
  portfolio_request
  payment_update
  pre_job_brief
  general
  announcement
}

enum ResponseStatus {
  pending
  accepted
  declined
  confirmed
  queried
  no_response
}

enum ImageType {
  polaroid
  comp_card
  digital
  editorial
  commercial
  test_shoot
}

enum CompCardStatus {
  current
  needs_update
  missing
}

enum DocumentType {
  management_agreement
  welcome_agreement
  nda
  code_of_conduct
  social_media_policy
  data_privacy_policy
  booking_confirmation
  call_sheet
  payment_statement
  other
}

enum CastingStatus {
  open
  closed
  cancelled
}

enum CastingResponse {
  interested
  not_available
}

enum MilestoneVisibility {
  named
  anonymous
}

// ==================== MODELS ====================

model User {
  id                   String    @id @default(uuid())
  email                String    @unique
  passwordHash         String    @map("password_hash")
  role                 UserRole
  isActive             Boolean   @default(true) @map("is_active")
  passwordResetToken   String?   @map("password_reset_token")
  passwordResetExpires DateTime? @map("password_reset_expires")
  lastLogin            DateTime? @map("last_login")
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")

  talentProfile        TalentProfile?
  sentNotifications    Notification[]       @relation("SentNotifications")
  uploadedImages       TalentPortfolioImage[] @relation("UploadedImages")
  uploadedDocuments    Document[]           @relation("UploadedDocuments")
  createdBookings      Booking[]            @relation("CreatedBookings")
  createdPayments      Payment[]            @relation("CreatedPayments")
  createdCastings      OpenCasting[]        @relation("CreatedCastings")
  statusChanges        BookingStatusHistory[]
  approvedMilestones   Milestone[]          @relation("ApprovedMilestones")

  @@map("users")
}

model TalentProfile {
  id                String         @id @default(uuid())
  userId            String?        @unique @map("user_id")
  firstName         String         @map("first_name")
  lastName          String         @map("last_name")
  category          TalentCategory
  status            TalentStatus   @default(active)
  exclusivity       Exclusivity
  primaryLocation   Location       @map("primary_location")
  secondaryLocation Location?      @map("secondary_location")
  instagramHandle   String?        @map("instagram_handle")
  phone             String?
  dateOfBirth       DateTime?      @map("date_of_birth")
  bio               String?
  polaroidUrl       String?        @map("polaroid_url")
  contractStartDate DateTime       @map("contract_start_date") @db.Date
  contractEndDate   DateTime       @map("contract_end_date") @db.Date
  contractType      ContractType   @map("contract_type")
  commissionRate    Decimal        @default(20.00) @map("commission_rate") @db.Decimal(5, 2)
  isPublic          Boolean        @default(true) @map("is_public")
  createdAt         DateTime       @default(now()) @map("created_at")
  updatedAt         DateTime       @updatedAt @map("updated_at")

  user              User?          @relation(fields: [userId], references: [id])
  measurements      TalentMeasurements?
  portfolioImages   TalentPortfolioImage[]
  portfolioStatus   TalentPortfolioStatus?
  bookings          Booking[]
  payments          Payment[]
  notifications     Notification[]
  notificationRecipients NotificationRecipient[]
  documents         Document[]
  castingInterests  CastingInterest[]
  castingAnalytics  CastingAnalytics?
  milestones        Milestone[]
  aiConversations   AiConversation[]

  @@index([category])
  @@index([primaryLocation])
  @@index([status])
  @@map("talent_profiles")
}

model TalentMeasurements {
  id            String  @id @default(uuid())
  talentId      String  @unique @map("talent_id")
  heightCm      Decimal? @map("height_cm") @db.Decimal(5, 1)
  heightDisplay String? @map("height_display")
  bust          String?
  waist         String?
  hips          String?
  shoeUk        String? @map("shoe_uk")
  shoeEu        String? @map("shoe_eu")
  hairColour    String? @map("hair_colour")
  eyeColour     String? @map("eye_colour")
  dressSize     String? @map("dress_size")
  updatedAt     DateTime @updatedAt @map("updated_at")

  talent        TalentProfile @relation(fields: [talentId], references: [id])

  @@map("talent_measurements")
}

model TalentPortfolioImage {
  id               String    @id @default(uuid())
  talentId         String    @map("talent_id")
  imageUrl         String    @map("image_url")
  imageType        ImageType @map("image_type")
  isPrimaryPolaroid Boolean  @default(false) @map("is_primary_polaroid")
  sortOrder        Int       @default(0) @map("sort_order")
  uploadedBy       String    @map("uploaded_by")
  createdAt        DateTime  @default(now()) @map("created_at")

  talent           TalentProfile @relation(fields: [talentId], references: [id])
  uploader         User          @relation("UploadedImages", fields: [uploadedBy], references: [id])

  @@map("talent_portfolio_images")
}

model TalentPortfolioStatus {
  id                  String        @id @default(uuid())
  talentId            String        @unique @map("talent_id")
  compCardStatus      CompCardStatus @default(missing) @map("comp_card_status")
  digitalsStatus      CompCardStatus @default(missing) @map("digitals_status")
  portfolioImageCount Int           @default(0) @map("portfolio_image_count")
  lastTestShoot       DateTime?     @map("last_test_shoot") @db.Date
  nextScheduledShoot  DateTime?     @map("next_scheduled_shoot") @db.Date
  notes               String?
  updatedAt           DateTime      @updatedAt @map("updated_at")

  talent              TalentProfile @relation(fields: [talentId], references: [id])

  @@map("talent_portfolio_status")
}

model Client {
  id            String     @id @default(uuid())
  companyName   String     @map("company_name")
  contactPerson String     @map("contact_person")
  email         String
  phone         String?
  address       String?
  clientType    ClientType @map("client_type")
  paymentTerms  String?    @map("payment_terms")
  notes         String?
  isActive      Boolean    @default(true) @map("is_active")
  createdAt     DateTime   @default(now()) @map("created_at")
  updatedAt     DateTime   @updatedAt @map("updated_at")

  bookings      Booking[]
  castings      OpenCasting[]

  @@map("clients")
}

model Booking {
  id                  String        @id @default(uuid())
  talentId            String        @map("talent_id")
  clientId            String        @map("client_id")
  projectTitle        String        @map("project_title")
  serviceType         String        @map("service_type")
  status              BookingStatus @default(pending)
  bookingDate         DateTime      @map("booking_date") @db.Date
  bookingEndDate      DateTime?     @map("booking_end_date") @db.Date
  callTime            String?       @map("call_time")
  locationCity        Location      @map("location_city")
  locationAddress     String?       @map("location_address")
  durationDescription String?       @map("duration_description")
  talentFee           Decimal       @map("talent_fee") @db.Decimal(12, 2)
  feeCurrency         Currency      @map("fee_currency")
  totalClientFee      Decimal?      @map("total_client_fee") @db.Decimal(12, 2)
  overtimeRate        String?       @default("1.5x hourly pro-rated") @map("overtime_rate")
  mediaUsage          String?       @map("media_usage")
  territory           String?
  usageTerm           String?       @map("usage_term")
  notes               String?
  preJobBriefSent     Boolean       @default(false) @map("pre_job_brief_sent")
  callSheetSent       Boolean       @default(false) @map("call_sheet_sent")
  createdBy           String        @map("created_by")
  createdAt           DateTime      @default(now()) @map("created_at")
  updatedAt           DateTime      @updatedAt @map("updated_at")

  talent              TalentProfile @relation(fields: [talentId], references: [id])
  client              Client        @relation(fields: [clientId], references: [id])
  creator             User          @relation("CreatedBookings", fields: [createdBy], references: [id])
  payments            Payment[]
  statusHistory       BookingStatusHistory[]
  notifications       Notification[]
  documents           Document[]
  milestones          Milestone[]

  @@index([talentId])
  @@index([clientId])
  @@index([status])
  @@index([bookingDate])
  @@map("bookings")
}

model BookingStatusHistory {
  id        String   @id @default(uuid())
  bookingId String   @map("booking_id")
  oldStatus String   @map("old_status")
  newStatus String   @map("new_status")
  changedBy String   @map("changed_by")
  createdAt DateTime @default(now()) @map("created_at")

  booking   Booking @relation(fields: [bookingId], references: [id])
  changer   User    @relation(fields: [changedBy], references: [id])

  @@map("booking_status_history")
}

model Payment {
  id                String        @id @default(uuid())
  bookingId         String        @map("booking_id")
  talentId          String        @map("talent_id")
  grossFee          Decimal       @map("gross_fee") @db.Decimal(12, 2)
  commissionRate    Decimal       @map("commission_rate") @db.Decimal(5, 2)
  commissionAmount  Decimal       @map("commission_amount") @db.Decimal(12, 2)
  netTalentPayment  Decimal       @map("net_talent_payment") @db.Decimal(12, 2)
  currency          Currency
  status            PaymentStatus @default(awaiting_client_payment)
  clientPaymentDate DateTime?     @map("client_payment_date") @db.Date
  talentPaymentDate DateTime?     @map("talent_payment_date") @db.Date
  invoiceNumber     String?       @map("invoice_number")
  notes             String?
  createdBy         String        @map("created_by")
  createdAt         DateTime      @default(now()) @map("created_at")
  updatedAt         DateTime      @updatedAt @map("updated_at")

  booking           Booking       @relation(fields: [bookingId], references: [id])
  talent            TalentProfile @relation(fields: [talentId], references: [id])
  creator           User          @relation("CreatedPayments", fields: [createdBy], references: [id])

  @@index([talentId])
  @@index([status])
  @@map("payments")
}

model Notification {
  id             String           @id @default(uuid())
  talentId       String?          @map("talent_id")
  senderId       String           @map("sender_id")
  type           NotificationType
  title          String
  body           String
  bookingId      String?          @map("booking_id")
  isRead         Boolean          @default(false) @map("is_read")
  responseStatus ResponseStatus   @default(pending) @map("response_status")
  responseText   String?          @map("response_text")
  respondedAt    DateTime?        @map("responded_at")
  escalated      Boolean          @default(false)
  escalatedAt    DateTime?        @map("escalated_at")
  createdAt      DateTime         @default(now()) @map("created_at")
  updatedAt      DateTime         @updatedAt @map("updated_at")

  talent         TalentProfile?   @relation(fields: [talentId], references: [id])
  sender         User             @relation("SentNotifications", fields: [senderId], references: [id])
  booking        Booking?         @relation(fields: [bookingId], references: [id])
  recipients     NotificationRecipient[]

  @@index([talentId])
  @@index([responseStatus])
  @@index([escalated])
  @@map("notifications")
}

model NotificationRecipient {
  id             String         @id @default(uuid())
  notificationId String         @map("notification_id")
  talentId       String         @map("talent_id")
  isRead         Boolean        @default(false) @map("is_read")
  responseStatus ResponseStatus @default(pending) @map("response_status")
  responseText   String?        @map("response_text")
  respondedAt    DateTime?      @map("responded_at")
  createdAt      DateTime       @default(now()) @map("created_at")

  notification   Notification   @relation(fields: [notificationId], references: [id])
  talent         TalentProfile  @relation(fields: [talentId], references: [id])

  @@map("notification_recipients")
}

model Document {
  id             String       @id @default(uuid())
  talentId       String       @map("talent_id")
  title          String
  documentType   DocumentType @map("document_type")
  fileUrl        String       @map("file_url")
  isPersonalised Boolean      @default(false) @map("is_personalised")
  dateSigned     DateTime?    @map("date_signed") @db.Date
  bookingId      String?      @map("booking_id")
  uploadedBy     String       @map("uploaded_by")
  createdAt      DateTime     @default(now()) @map("created_at")

  talent         TalentProfile @relation(fields: [talentId], references: [id])
  booking        Booking?      @relation(fields: [bookingId], references: [id])
  uploader       User          @relation("UploadedDocuments", fields: [uploadedBy], references: [id])

  @@index([talentId])
  @@map("documents")
}

model OpenCasting {
  id                String         @id @default(uuid())
  title             String
  description       String
  category          TalentCategory
  location          Location
  shootDateStart    DateTime       @map("shoot_date_start") @db.Date
  shootDateEnd      DateTime?      @map("shoot_date_end") @db.Date
  workType          String         @map("work_type")
  mediaUsage        String?        @map("media_usage")
  requirements      String?
  deadline          DateTime
  status            CastingStatus  @default(open)
  clientId          String         @map("client_id")
  brandNameInternal String         @map("brand_name_internal")
  createdBy         String         @map("created_by")
  createdAt         DateTime       @default(now()) @map("created_at")
  updatedAt         DateTime       @updatedAt @map("updated_at")

  client            Client         @relation(fields: [clientId], references: [id])
  creator           User           @relation("CreatedCastings", fields: [createdBy], references: [id])
  interests         CastingInterest[]

  @@index([status])
  @@index([deadline])
  @@map("open_castings")
}

model CastingInterest {
  id              String          @id @default(uuid())
  castingId       String          @map("casting_id")
  talentId        String          @map("talent_id")
  response        CastingResponse
  calendarConflict Boolean        @default(false) @map("calendar_conflict")
  conflictDetails String?         @map("conflict_details")
  shortlisted     Boolean         @default(false)
  selected        Boolean         @default(false)
  createdAt       DateTime        @default(now()) @map("created_at")

  casting         OpenCasting     @relation(fields: [castingId], references: [id])
  talent          TalentProfile   @relation(fields: [talentId], references: [id])

  @@index([castingId])
  @@index([talentId])
  @@map("casting_interests")
}

model CastingAnalytics {
  id                    String  @id @default(uuid())
  talentId              String  @unique @map("talent_id")
  eligibleCastings30d   Int     @default(0) @map("eligible_castings_30d")
  responses30d          Int     @default(0) @map("responses_30d")
  engagementRate30d     Decimal @default(0) @map("engagement_rate_30d") @db.Decimal(5, 2)
  interests90d          Int     @default(0) @map("interests_90d")
  selections90d         Int     @default(0) @map("selections_90d")
  selectionRate90d      Decimal @default(0) @map("selection_rate_90d") @db.Decimal(5, 2)
  flagLowEngagement     Boolean @default(false) @map("flag_low_engagement")
  flagLowSelection      Boolean @default(false) @map("flag_low_selection")
  updatedAt             DateTime @updatedAt @map("updated_at")

  talent                TalentProfile @relation(fields: [talentId], references: [id])

  @@map("casting_analytics")
}

model Milestone {
  id              String              @id @default(uuid())
  talentId        String              @map("talent_id")
  bookingId       String              @map("booking_id")
  visibility      MilestoneVisibility
  displayText     String              @map("display_text")
  adminApproved   Boolean             @default(false) @map("admin_approved")
  approvedBy      String?             @map("approved_by")
  isPublished     Boolean             @default(false) @map("is_published")
  createdAt       DateTime            @default(now()) @map("created_at")

  talent          TalentProfile @relation(fields: [talentId], references: [id])
  booking         Booking       @relation(fields: [bookingId], references: [id])
  approver        User?         @relation("ApprovedMilestones", fields: [approvedBy], references: [id])

  @@index([isPublished])
  @@map("milestones")
}

model AiConversation {
  id        String   @id @default(uuid())
  talentId  String   @map("talent_id")
  messages  Json     @default("[]")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  talent    TalentProfile @relation(fields: [talentId], references: [id])

  @@map("ai_conversations")
}
```

### Run Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## Core Library Files

### `src/lib/prisma.ts` — Prisma Singleton

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### `src/lib/auth.ts` — JWT Handling

```typescript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'talent' | 'booker' | 'md' | 'ceo';
}

export function createToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getCurrentUser(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('candor_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
```

### `src/lib/middleware.ts` — API Route Auth Middleware

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JwtPayload } from './auth';
import { prisma } from './prisma';

type AllowedRoles = ('talent' | 'booker' | 'md' | 'ceo')[];

export async function withAuth(
  req: NextRequest,
  allowedRoles: AllowedRoles,
  handler: (req: NextRequest, user: JwtPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  const token = req.cookies.get('candor_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  if (!allowedRoles.includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Check user is still active
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.isActive) {
    return NextResponse.json({ error: 'Account disabled' }, { status: 403 });
  }

  return handler(req, payload);
}

// Helper to get talent_id from user_id
export async function getTalentId(userId: string): Promise<string | null> {
  const profile = await prisma.talentProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  return profile?.id || null;
}
```

### `src/lib/notifications.ts` — Notification Helpers

```typescript
import { prisma } from './prisma';
import { NotificationType } from '@prisma/client';

interface CreateNotificationInput {
  talentId: string;
  senderId: string;
  type: NotificationType;
  title: string;
  body: string;
  bookingId?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      talentId: input.talentId,
      senderId: input.senderId,
      type: input.type,
      title: input.title,
      body: input.body,
      bookingId: input.bookingId || null,
    },
  });
}

// Auto-generate notification when booking status changes
export async function notifyBookingStatusChange(
  bookingId: string,
  newStatus: string,
  senderId: string
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { talent: true, client: true },
  });

  if (!booking) return;

  const statusMessages: Record<string, string> = {
    confirmed: `Great news — your booking "${booking.projectTitle}" has been confirmed! Check the Bookings section for full details.`,
    cancelled: `Your booking "${booking.projectTitle}" has been cancelled. If you have questions, reach out to your Candor booker.`,
    completed: `Your booking "${booking.projectTitle}" is marked as completed. Payment processing will begin shortly.`,
  };

  const message = statusMessages[newStatus];
  if (!message) return;

  await createNotification({
    talentId: booking.talentId,
    senderId,
    type: 'booking_update',
    title: `Booking ${newStatus} — ${booking.projectTitle}`,
    body: message,
    bookingId: booking.id,
  });
}
```

---

## Scheduled Jobs

### `src/jobs/escalate-notifications.ts`

```typescript
import { prisma } from '../lib/prisma';
import { subHours } from 'date-fns';

export async function escalateNotifications() {
  const escalationHours = parseInt(process.env.ESCALATION_HOURS || '10');
  const cutoff = subHours(new Date(), escalationHours);

  // Escalate individual notifications
  const result = await prisma.notification.updateMany({
    where: {
      responseStatus: 'pending',
      escalated: false,
      createdAt: { lt: cutoff },
      type: {
        in: ['availability_check', 'booking_update', 'portfolio_request', 'pre_job_brief'],
      },
    },
    data: {
      escalated: true,
      escalatedAt: new Date(),
    },
  });

  console.log(`Escalated ${result.count} notifications`);

  // Escalate group notification recipients
  const recipientResult = await prisma.notificationRecipient.updateMany({
    where: {
      responseStatus: 'pending',
      createdAt: { lt: cutoff },
    },
    data: {
      responseStatus: 'no_response',
    },
  });

  console.log(`Marked ${recipientResult.count} group recipients as no_response`);
}
```

### `src/jobs/close-expired-castings.ts`

```typescript
import { prisma } from '../lib/prisma';

export async function closeExpiredCastings() {
  const result = await prisma.openCasting.updateMany({
    where: {
      status: 'open',
      deadline: { lt: new Date() },
    },
    data: {
      status: 'closed',
    },
  });

  console.log(`Closed ${result.count} expired castings`);
}
```

### `scripts/run-jobs.ts` — CLI Runner

```typescript
import { escalateNotifications } from '../src/jobs/escalate-notifications';
import { closeExpiredCastings } from '../src/jobs/close-expired-castings';
import { recalculateCastingAnalytics } from '../src/jobs/recalculate-casting-analytics';
import { checkContractExpiry } from '../src/jobs/contract-expiry-alerts';

const job = process.argv[2];

async function run() {
  switch (job) {
    case 'escalate':
      await escalateNotifications();
      break;
    case 'close-castings':
      await closeExpiredCastings();
      break;
    case 'casting-analytics':
      await recalculateCastingAnalytics();
      break;
    case 'contract-expiry':
      await checkContractExpiry();
      break;
    default:
      console.log('Available jobs: escalate, close-castings, casting-analytics, contract-expiry');
  }
  process.exit(0);
}

run();
```

Run via cron or external scheduler:
```bash
# Every 30 minutes
npx ts-node scripts/run-jobs.ts escalate

# Every 15 minutes
npx ts-node scripts/run-jobs.ts close-castings

# Weekly (Sunday midnight)
npx ts-node scripts/run-jobs.ts casting-analytics

# Daily (6am)
npx ts-node scripts/run-jobs.ts contract-expiry
```

---

## Seed Script

### `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create CEO account
  const ceoPassword = await bcrypt.hash('changeme123', 12);
  await prisma.user.upsert({
    where: { email: 'ceo@candor-management.com' },
    update: {},
    create: {
      email: 'ceo@candor-management.com',
      passwordHash: ceoPassword,
      role: 'ceo',
      isActive: true,
    },
  });

  console.log('CEO account created: ceo@candor-management.com / changeme123');
  console.log('CHANGE THIS PASSWORD IMMEDIATELY after first login.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"commonjs\"} prisma/seed.ts"
  }
}
```

Run: `npx prisma db seed`
