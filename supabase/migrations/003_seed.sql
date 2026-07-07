-- ============================================================================
-- 003_seed.sql — Realistic development/demo seed data
-- Adapted from lib/data.js and lib/seed.js.
--
-- AUTH CAVEAT (read this): these profile rows are NOT backed by auth.users
-- rows — hosted Supabase does not allow inserting into auth.users from plain
-- SQL. That is exactly why 001_schema.sql gives profiles.id no FK to
-- auth.users. Seeded people therefore exist as data but CANNOT log in. To
-- demo login, create users via the Supabase dashboard / Admin API with
-- matching emails, then point the row at the real auth id:
--   update public.profiles set id = '<auth-user-uuid>' where email = '...';
--   (talent_profiles.user_id follows via the same update if you change it too)
-- or simply sign the user up and let the on_auth_user_created trigger create
-- a fresh profile row.
--
-- All PKs are fixed UUIDs ('00000000-0000-4000-8000-xxxxxxxxxxxx') so FKs are
-- stable and the file is re-runnable (every insert is ON CONFLICT DO NOTHING).
-- UUID suffix map:
--   00a1-00a5  admin profiles          0101-010a  talent user profiles
--   0201-020a  talent_profiles         0c01-0c07  talent_measurements
--   0b01-0b0c  portfolio images        0301-0308  clients
--   0401-0414  bookings                0e01-0e1a  booking_status_history
--   0501-050b  payments                0601-0609  notifications
--   0f01-0f06  notification_recipients 0701-0709  documents
--   0801-0805  open_castings           0901-090b  casting_interests
--   0a01-0a05  milestones              0d01-0d02  ai_conversations
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Profiles — admin team (from lib/seed.js TEAM)
-- ----------------------------------------------------------------------------
insert into public.profiles (id, full_name, email, role, is_active) values
  ('00000000-0000-4000-8000-0000000000a1', 'Ileri Obasanjo', 'ileri@candoragency.com',  'ceo',    true),
  ('00000000-0000-4000-8000-0000000000a2', 'Tife Adeyemi',   'tife@candoragency.com',   'md',     true),
  ('00000000-0000-4000-8000-0000000000a3', 'Aliyu Musa',     'aliyu@candoragency.com',  'booker', true),
  ('00000000-0000-4000-8000-0000000000a4', 'Tomi Johnson',   'tomi@candoragency.com',   'booker', true),
  ('00000000-0000-4000-8000-0000000000a5', 'Adaora Okeke',   'adaora@candoragency.com', 'md',     true)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Profiles — talent logins (from lib/data.js talent, plus three non-model
-- categories to exercise the category enum)
-- ----------------------------------------------------------------------------
insert into public.profiles (id, full_name, email, role, is_active) values
  ('00000000-0000-4000-8000-000000000101', 'Ayotomiwa Durojaye', 'zara@candoragency.com',    'talent', true),
  ('00000000-0000-4000-8000-000000000102', 'John Smith',         'phoenix@candoragency.com', 'talent', true),
  ('00000000-0000-4000-8000-000000000103', 'Chioma Nwosu',       'atlas@candoragency.com',   'talent', true),
  ('00000000-0000-4000-8000-000000000104', 'Emeka Okafor',       'blaze@candoragency.com',   'talent', true),
  ('00000000-0000-4000-8000-000000000105', 'Adaeze Ikenna',      'velvet@candoragency.com',  'talent', true),
  ('00000000-0000-4000-8000-000000000106', 'Tunde Abiola',       'storm@candoragency.com',   'talent', true),
  ('00000000-0000-4000-8000-000000000107', 'Ngozi Eze',          'muse@candoragency.com',    'talent', false), -- inactive
  ('00000000-0000-4000-8000-000000000108', 'Sade Balogun',       'sade@candoragency.com',    'talent', true),
  ('00000000-0000-4000-8000-000000000109', 'Dami Adeleke',       'dami@candoragency.com',    'talent', true),
  ('00000000-0000-4000-8000-00000000010a', 'Zainab Bello',       'zainab@candoragency.com',  'talent', true)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Talent profiles (portfolio-status fields folded in)
-- ----------------------------------------------------------------------------
insert into public.talent_profiles
  (id, user_id, first_name, last_name, category, status, exclusivity,
   primary_location, secondary_location, instagram_handle, phone, date_of_birth,
   bio, polaroid_url, contract_start_date, contract_end_date, contract_type,
   commission_rate, is_public,
   comp_card_status, digitals_status, last_test_shoot, next_scheduled_shoot, portfolio_notes)
values
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000101',
   'Ayotomiwa', 'Durojaye', 'model', 'active', 'exclusive', 'lagos', null,
   '@zara.models', '+234 801 234 5678', '2004-02-11',
   'Zara joined Candor in 2025. Lagos-based fashion model, Afropolitan May cover star.',
   '/images/talent/zara/polaroid.jpg', '2025-06-15', '2027-06-15', 'full_management',
   20.00, true, 'current', 'current', '2026-01-15', '2026-08-01', 'Book updated after Afropolitan cover.'),

  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000102',
   'John', 'Smith', 'model', 'active', 'exclusive', 'lagos', null,
   '@phoenix.models', '+234 802 345 6789', '2001-05-30',
   'Phoenix is a Lagos commercial model with strong TVC experience.',
   '/images/talent/phoenix/polaroid.jpg', '2025-04-20', '2027-04-20', 'full_management',
   20.00, true, 'current', 'needs_update', '2025-11-20', null, 'Digitals refresh requested July 2026.'),

  ('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000103',
   'Chioma', 'Nwosu', 'model', 'active', 'exclusive', 'lagos', 'london',
   '@atlas.models', '+234 803 456 7890', '2003-08-19',
   'Atlas is Candor''s most-booked fashion model, splitting time between Lagos and London.',
   '/images/talent/atlas/polaroid.jpg', '2025-05-10', '2027-05-10', 'full_management',
   20.00, true, 'current', 'current', '2026-02-10', '2026-07-28', null),

  ('00000000-0000-4000-8000-000000000204', '00000000-0000-4000-8000-000000000104',
   'Emeka', 'Okafor', 'model', 'active', 'non_exclusive', 'lagos', null,
   '@blaze.official', '+234 804 567 8901', '1999-01-24',
   'Blaze is a new face on the men''s board, onboarded early 2026.',
   '/images/talent/blaze/polaroid.jpg', '2026-02-28', '2027-02-28', 'welcome_agreement',
   20.00, false, 'missing', 'missing', null, '2026-07-20', 'First comp card shoot scheduled.'),

  ('00000000-0000-4000-8000-000000000205', '00000000-0000-4000-8000-000000000105',
   'Adaeze', 'Ikenna', 'model', 'active', 'non_exclusive', 'lagos', null,
   '@velvet.ng', '+234 805 678 9012', '2005-07-02',
   'Velvet is a commercial new face, currently completing the welcome year.',
   '/images/talent/velvet/polaroid.jpg', '2026-03-10', '2027-03-10', 'welcome_agreement',
   20.00, false, 'missing', 'missing', null, null, null),

  ('00000000-0000-4000-8000-000000000206', '00000000-0000-4000-8000-000000000106',
   'Tunde', 'Abiola', 'model', 'active', 'exclusive', 'lagos', null,
   '@storm.lagos', '+234 806 789 0123', '2002-03-15',
   'Storm works commercial and runway across Lagos.',
   '/images/talent/storm/polaroid.jpg', '2025-08-01', '2026-08-01', 'full_management',
   20.00, true, 'current', 'current', '2025-12-05', null, 'Contract renewal conversation due — ends Aug 2026.'),

  ('00000000-0000-4000-8000-000000000207', '00000000-0000-4000-8000-000000000107',
   'Ngozi', 'Eze', 'model', 'inactive', 'non_exclusive', 'london', null,
   '@muse.london', '+44 7911 123456', '2006-04-08',
   'Muse is an editorial model based in London, currently on pause.',
   '/images/talent/muse/polaroid.jpg', '2025-01-15', '2026-01-15', 'full_management',
   20.00, false, 'needs_update', 'needs_update', '2025-06-20', null, 'Book outdated; refresh before reactivation.'),

  ('00000000-0000-4000-8000-000000000208', '00000000-0000-4000-8000-000000000108',
   'Sade', 'Balogun', 'photographer', 'active', 'non_exclusive', 'lagos', null,
   '@sade.shoots', '+234 807 890 1234', '1996-10-12',
   'Sade is an editorial and campaign photographer, shot the Afropolitan May cover.',
   '/images/talent/sade/polaroid.jpg', '2025-09-01', '2026-09-01', 'full_management',
   20.00, true, 'current', 'current', null, null, null),

  ('00000000-0000-4000-8000-000000000209', '00000000-0000-4000-8000-000000000109',
   'Dami', 'Adeleke', 'content_creator', 'active', 'non_exclusive', 'lagos', null,
   '@dami.creates', '+234 808 901 2345', '2000-12-01',
   'Dami creates short-form brand content with a 400k social following.',
   '/images/talent/dami/polaroid.jpg', '2025-11-01', '2026-11-01', 'full_management',
   20.00, true, 'current', 'current', null, null, null),

  ('00000000-0000-4000-8000-00000000020a', '00000000-0000-4000-8000-00000000010a',
   'Zainab', 'Bello', 'influencer', 'active', 'non_exclusive', 'usa', 'lagos',
   '@zainabbello', '+1 917 555 0142', '1998-06-27',
   'Zainab is a New York based lifestyle influencer working diaspora campaigns.',
   '/images/talent/zainab/polaroid.jpg', '2025-10-15', '2026-10-15', 'full_management',
   20.00, true, 'current', 'needs_update', null, null, null)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Measurements (models only)
-- ----------------------------------------------------------------------------
insert into public.talent_measurements
  (id, talent_id, height_cm, height_display, bust, waist, hips,
   shoe_uk, shoe_eu, hair_colour, eye_colour, dress_size)
values
  ('00000000-0000-4000-8000-000000000c01', '00000000-0000-4000-8000-000000000201',
   175.0, '5''9"', '82 cm', '60 cm', '88 cm', 'UK 6',  'EU 39', 'Black', 'Brown', 'UK 8'),
  ('00000000-0000-4000-8000-000000000c02', '00000000-0000-4000-8000-000000000202',
   178.0, '5''10"', '96 cm', '78 cm', '92 cm', 'UK 9',  'EU 43', 'Black', 'Dark Brown', null),
  ('00000000-0000-4000-8000-000000000c03', '00000000-0000-4000-8000-000000000203',
   180.0, '5''11"', '84 cm', '62 cm', '90 cm', 'UK 6.5','EU 40', 'Black', 'Brown', 'UK 8'),
  ('00000000-0000-4000-8000-000000000c04', '00000000-0000-4000-8000-000000000204',
   185.0, '6''1"', '100 cm', '80 cm', '94 cm', 'UK 10', 'EU 44', 'Black', 'Brown', null),
  ('00000000-0000-4000-8000-000000000c05', '00000000-0000-4000-8000-000000000205',
   172.0, '5''8"', '80 cm', '58 cm', '86 cm', 'UK 5',  'EU 38', 'Dark Brown', 'Brown', 'UK 6'),
  ('00000000-0000-4000-8000-000000000c06', '00000000-0000-4000-8000-000000000206',
   182.0, '6''0"', '98 cm', '76 cm', '90 cm', 'UK 9',  'EU 43', 'Black', 'Dark Brown', null),
  ('00000000-0000-4000-8000-000000000c07', '00000000-0000-4000-8000-000000000207',
   176.0, '5''9"', '81 cm', '59 cm', '87 cm', 'UK 6',  'EU 39', 'Black', 'Hazel', 'UK 8')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Portfolio images (primary polaroid + a couple of book images each for the
-- public talent; uploaded by Aliyu, booker)
-- ----------------------------------------------------------------------------
insert into public.talent_portfolio_images
  (id, talent_id, image_url, image_type, is_primary_polaroid, sort_order, uploaded_by)
values
  ('00000000-0000-4000-8000-000000000b01', '00000000-0000-4000-8000-000000000201',
   '/images/talent/zara/polaroid.jpg',      'polaroid',   true,  0, '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000b02', '00000000-0000-4000-8000-000000000201',
   '/images/talent/zara/editorial-01.jpg',  'editorial',  false, 1, '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000b03', '00000000-0000-4000-8000-000000000201',
   '/images/talent/zara/compcard.jpg',      'comp_card',  false, 2, '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000b04', '00000000-0000-4000-8000-000000000202',
   '/images/talent/phoenix/polaroid.jpg',   'polaroid',   true,  0, '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000b05', '00000000-0000-4000-8000-000000000202',
   '/images/talent/phoenix/commercial-01.jpg', 'commercial', false, 1, '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000b06', '00000000-0000-4000-8000-000000000203',
   '/images/talent/atlas/polaroid.jpg',     'polaroid',   true,  0, '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000b07', '00000000-0000-4000-8000-000000000203',
   '/images/talent/atlas/editorial-01.jpg', 'editorial',  false, 1, '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000b08', '00000000-0000-4000-8000-000000000206',
   '/images/talent/storm/polaroid.jpg',     'polaroid',   true,  0, '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000b09', '00000000-0000-4000-8000-000000000208',
   '/images/talent/sade/polaroid.jpg',      'polaroid',   true,  0, '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000b0a', '00000000-0000-4000-8000-000000000209',
   '/images/talent/dami/polaroid.jpg',      'polaroid',   true,  0, '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000b0b', '00000000-0000-4000-8000-00000000020a',
   '/images/talent/zainab/polaroid.jpg',    'polaroid',   true,  0, '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000b0c', '00000000-0000-4000-8000-000000000206',
   '/images/talent/storm/test-01.jpg',      'test_shoot', false, 1, '00000000-0000-4000-8000-0000000000a3')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Clients (from lib/data.js plus Vlisco, Afropolitan, Zenith Bank)
-- ----------------------------------------------------------------------------
insert into public.clients
  (id, company_name, contact_person, email, phone, address, client_type,
   payment_terms, notes, is_active)
values
  ('00000000-0000-4000-8000-000000000301', 'Lagos Fashion Week', 'Mrs. Folake Coker',
   'bookings@lagosfashionweek.ng', '+234 901 234 5678', 'Federal Palace Hotel, Victoria Island, Lagos',
   'established', 'Net 14', 'Anchor client — runway shows twice a year.', true),
  ('00000000-0000-4000-8000-000000000302', 'GTBank', 'Mr. Ade Williams',
   'marketing@gtbank.com', '+234 902 345 6789', '635 Akin Adesola St, Victoria Island, Lagos',
   'established', 'Net 14', 'Corporate campaigns; annual report shoot every Q2.', true),
  ('00000000-0000-4000-8000-000000000303', 'Ziva Lagos', 'Nneka Obi',
   'creative@zivalagos.com', '+234 903 456 7890', '14 Admiralty Way, Lekki Phase 1, Lagos',
   'established', 'Net 14', 'Fashion brand — editorials and lookbooks.', true),
  ('00000000-0000-4000-8000-000000000304', 'Pepsi Nigeria', 'Chidi Nnamdi',
   'agency@pepsi.ng', '+234 904 567 8901', 'Ikeja, Lagos',
   'new', '100% upfront', 'New client — upfront payment 48hrs before shoot.', true),
  ('00000000-0000-4000-8000-000000000305', 'Vogue Afrique', 'Amara Diop',
   'casting@voguefr.com', '+33 6 12 34 56 78', 'Paris / Lagos',
   'established', 'Net 14', 'Editorial titles across Africa and Europe.', true),
  ('00000000-0000-4000-8000-000000000306', 'Vlisco', 'Kwame Asante',
   'campaigns@vlisco.com', '+31 20 555 0199', 'Helmond, Netherlands / Lagos showroom',
   'established', 'Net 14', 'Heritage textile campaigns; SS26 booked.', true),
  ('00000000-0000-4000-8000-000000000307', 'Afropolitan Magazine', 'Efe Oghene',
   'features@afropolitanmag.com', '+234 905 678 9012', 'Ikoyi, Lagos',
   'established', 'Net 14', 'Cover stories and editorial features.', true),
  ('00000000-0000-4000-8000-000000000308', 'Zenith Bank', 'Bola Adesina',
   'brand@zenithbank.com', '+234 906 789 0123', 'Ajose Adeogun St, Victoria Island, Lagos',
   'new', '100% upfront', 'First campaign June 2026 postponed; diaspora campaign delivered.', true)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Bookings — 20 rows across all five statuses.
-- Multi-talent jobs (e.g. LFW runway) are one row per talent.
-- Timeline is relative to mid-2026: Apr/May = completed, Jul/Aug = upcoming.
-- ----------------------------------------------------------------------------
insert into public.bookings
  (id, talent_id, client_id, project_title, service_type, status,
   booking_date, booking_end_date, call_time, location_city, location_address,
   duration_description, talent_fee, fee_currency, media_usage, territory,
   usage_term, notes, pre_job_brief_sent, call_sheet_sent, created_by)
values
  -- Completed --------------------------------------------------------------
  ('00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000201',
   '00000000-0000-4000-8000-000000000301', 'Lagos Fashion Week — Runway Show', 'Runway',
   'completed', '2026-04-12', '2026-04-13', '07:00', 'lagos',
   'Federal Palace Hotel, Victoria Island', '2 days', 600000.00, 'NGN',
   'Social media + press', 'West Africa', '6 months', null, true, true,
   '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000402', '00000000-0000-4000-8000-000000000203',
   '00000000-0000-4000-8000-000000000301', 'Lagos Fashion Week — Runway Show', 'Runway',
   'completed', '2026-04-12', '2026-04-13', '07:00', 'lagos',
   'Federal Palace Hotel, Victoria Island', '2 days', 600000.00, 'NGN',
   'Social media + press', 'West Africa', '6 months', null, true, true,
   '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000403', '00000000-0000-4000-8000-000000000206',
   '00000000-0000-4000-8000-000000000301', 'Lagos Fashion Week — Runway Show', 'Runway',
   'completed', '2026-04-12', '2026-04-13', '07:00', 'lagos',
   'Federal Palace Hotel, Victoria Island', '2 days', 600000.00, 'NGN',
   'Social media + press', 'West Africa', '6 months', null, true, true,
   '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000404', '00000000-0000-4000-8000-000000000201',
   '00000000-0000-4000-8000-000000000303', 'Ziva Lagos — SS26 Editorial', 'Editorial',
   'completed', '2026-03-28', '2026-03-28', '08:00', 'lagos',
   'Eko Hotel Studio, Victoria Island', '1 day', 450000.00, 'NGN',
   'Print + digital', 'Africa', '12 months', 'Mood: minimal luxury.', true, true,
   '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000405', '00000000-0000-4000-8000-000000000202',
   '00000000-0000-4000-8000-000000000302', 'GTBank — Annual Report Campaign', 'Commercial shoot',
   'completed', '2026-04-05', '2026-04-06', '08:30', 'lagos',
   'GTBank HQ, Victoria Island', '2 days', 600000.00, 'NGN',
   'TV + digital + OOH', 'Nigeria', '12 months', null, true, true,
   '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000406', '00000000-0000-4000-8000-000000000203',
   '00000000-0000-4000-8000-000000000302', 'GTBank — Annual Report Campaign', 'Commercial shoot',
   'completed', '2026-04-05', '2026-04-06', '08:30', 'lagos',
   'GTBank HQ, Victoria Island', '2 days', 600000.00, 'NGN',
   'TV + digital + OOH', 'Nigeria', '12 months', null, true, true,
   '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000407', '00000000-0000-4000-8000-000000000201',
   '00000000-0000-4000-8000-000000000307', 'Afropolitan Magazine — May Cover Story', 'Editorial',
   'completed', '2026-04-14', '2026-04-14', '09:00', 'lagos',
   'Afropolitan Studio, Ikoyi', '1 day', 656250.00, 'NGN',
   'Print + social', 'Worldwide', '12 months', 'Candor''s first magazine cover.', true, true,
   '00000000-0000-4000-8000-0000000000a5'),
  ('00000000-0000-4000-8000-000000000408', '00000000-0000-4000-8000-000000000208',
   '00000000-0000-4000-8000-000000000307', 'Afropolitan Magazine — Cover Story Photography', 'Photography',
   'completed', '2026-04-14', '2026-04-14', '08:00', 'lagos',
   'Afropolitan Studio, Ikoyi', '1 day', 400000.00, 'NGN',
   'Print + social', 'Worldwide', '12 months', null, true, true,
   '00000000-0000-4000-8000-0000000000a5'),
  ('00000000-0000-4000-8000-000000000409', '00000000-0000-4000-8000-000000000202',
   '00000000-0000-4000-8000-000000000304', 'Pepsi Nigeria — Youth Energy TVC', 'TVC',
   'completed', '2026-05-01', '2026-05-03', '06:30', 'lagos',
   'Ikoyi Film Studio', '3 days', 2000000.00, 'NGN',
   'TV + digital + social', 'West Africa', '24 months', 'Wardrobe fitting 28 Apr, Ikoyi studio.', true, true,
   '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-00000000040a', '00000000-0000-4000-8000-00000000020a',
   '00000000-0000-4000-8000-000000000308', 'Zenith Bank — US Diaspora Campaign', 'Commercial shoot',
   'completed', '2026-05-20', '2026-05-20', '10:00', 'usa_other',
   'Brooklyn Studio, New York', '1 day', 3000.00, 'USD',
   'Digital + social', 'USA', '12 months', null, true, true,
   '00000000-0000-4000-8000-0000000000a4'),
  -- Confirmed (upcoming) -----------------------------------------------------
  ('00000000-0000-4000-8000-00000000040b', '00000000-0000-4000-8000-000000000201',
   '00000000-0000-4000-8000-000000000306', 'Vlisco — SS26 Heritage Campaign', 'Commercial shoot',
   'confirmed', '2026-07-20', '2026-07-21', '07:30', 'lagos',
   'Vlisco Showroom, Lekki Phase 1', '2 days', 1500000.00, 'NGN',
   'Print + digital + OOH', 'Worldwide', '12 months', null, true, false,
   '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-00000000040c', '00000000-0000-4000-8000-000000000203',
   '00000000-0000-4000-8000-000000000306', 'Vlisco — SS26 Heritage Campaign', 'Commercial shoot',
   'confirmed', '2026-07-20', '2026-07-21', '07:30', 'lagos',
   'Vlisco Showroom, Lekki Phase 1', '2 days', 1500000.00, 'NGN',
   'Print + digital + OOH', 'Worldwide', '12 months', null, true, false,
   '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-00000000040d', '00000000-0000-4000-8000-000000000209',
   '00000000-0000-4000-8000-000000000304', 'Pepsi Nigeria — Social Content Series', 'Content creation',
   'confirmed', '2026-07-25', '2026-07-25', '11:00', 'lagos',
   'Pepsi Content Lab, Ikeja', '1 day', 750000.00, 'NGN',
   'Social media', 'Nigeria', '6 months', 'Six short-form videos.', false, false,
   '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-00000000040e', '00000000-0000-4000-8000-000000000207',
   '00000000-0000-4000-8000-000000000305', 'Vogue Afrique — London Portfolio Editorial', 'Editorial',
   'confirmed', '2026-08-03', '2026-08-03', '09:00', 'london',
   'Studio 9, Shoreditch, London', '1 day', 1200.00, 'GBP',
   'Print', 'Worldwide', 'Perpetuity', 'Reactivation editorial for Muse.', false, false,
   '00000000-0000-4000-8000-0000000000a2'),
  -- Pending ------------------------------------------------------------------
  ('00000000-0000-4000-8000-00000000040f', '00000000-0000-4000-8000-000000000203',
   '00000000-0000-4000-8000-000000000305', 'Vogue Afrique — Lagos Editorial Spread', 'Editorial',
   'pending', '2026-08-10', '2026-08-11', null, 'lagos',
   'Lagos studio TBC', '2 days', 500000.00, 'NGN',
   'Print', 'Worldwide', 'Perpetuity', null, false, false,
   '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000410', '00000000-0000-4000-8000-000000000206',
   '00000000-0000-4000-8000-000000000308', 'Zenith Bank — Retail Banking Commercial', 'Commercial shoot',
   'pending', '2026-08-15', '2026-08-16', null, 'lagos',
   'Zenith HQ, Victoria Island', '2 days', 800000.00, 'NGN',
   'TV + digital', 'Nigeria', '12 months', null, false, false,
   '00000000-0000-4000-8000-0000000000a4'),
  ('00000000-0000-4000-8000-000000000411', '00000000-0000-4000-8000-000000000205',
   '00000000-0000-4000-8000-000000000303', 'Ziva Lagos — Resort Lookbook', 'E-commerce',
   'pending', '2026-07-30', '2026-07-30', null, 'lagos',
   'Ziva Studio, Lekki', 'Half day', 300000.00, 'NGN',
   'Web + social', 'Nigeria', '6 months', 'First paid job for Velvet.', false, false,
   '00000000-0000-4000-8000-0000000000a3'),
  -- Casting sent ---------------------------------------------------------------
  ('00000000-0000-4000-8000-000000000412', '00000000-0000-4000-8000-000000000204',
   '00000000-0000-4000-8000-000000000301', 'Lagos Fashion Week — Resort Showcase', 'Runway',
   'casting_sent', '2026-09-05', '2026-09-05', null, 'lagos',
   'Federal Palace Hotel, Victoria Island', '1 day', 350000.00, 'NGN',
   'Social media', 'Nigeria', '3 months', 'New faces showcase.', false, false,
   '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000413', '00000000-0000-4000-8000-000000000205',
   '00000000-0000-4000-8000-000000000301', 'Lagos Fashion Week — Resort Showcase', 'Runway',
   'casting_sent', '2026-09-05', '2026-09-05', null, 'lagos',
   'Federal Palace Hotel, Victoria Island', '1 day', 350000.00, 'NGN',
   'Social media', 'Nigeria', '3 months', 'New faces showcase.', false, false,
   '00000000-0000-4000-8000-0000000000a3'),
  -- Cancelled ------------------------------------------------------------------
  ('00000000-0000-4000-8000-000000000414', '00000000-0000-4000-8000-000000000202',
   '00000000-0000-4000-8000-000000000308', 'Zenith Bank — Billboard Campaign', 'Commercial shoot',
   'cancelled', '2026-06-10', '2026-06-10', null, 'lagos',
   'Zenith HQ, Victoria Island', '1 day', 700000.00, 'NGN',
   'OOH', 'Nigeria', '12 months', 'Client postponed campaign indefinitely.', false, false,
   '00000000-0000-4000-8000-0000000000a4')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Booking status history — pending -> confirmed -> completed / cancelled
-- ----------------------------------------------------------------------------
insert into public.booking_status_history (id, booking_id, old_status, new_status, changed_by, created_at) values
  -- completed bookings: two transitions each
  ('00000000-0000-4000-8000-000000000e01', '00000000-0000-4000-8000-000000000401', 'pending',   'confirmed', '00000000-0000-4000-8000-0000000000a3', '2026-03-18 14:00+01'),
  ('00000000-0000-4000-8000-000000000e02', '00000000-0000-4000-8000-000000000401', 'confirmed', 'completed', '00000000-0000-4000-8000-0000000000a3', '2026-04-14 10:00+01'),
  ('00000000-0000-4000-8000-000000000e03', '00000000-0000-4000-8000-000000000402', 'pending',   'confirmed', '00000000-0000-4000-8000-0000000000a3', '2026-03-18 14:00+01'),
  ('00000000-0000-4000-8000-000000000e04', '00000000-0000-4000-8000-000000000402', 'confirmed', 'completed', '00000000-0000-4000-8000-0000000000a3', '2026-04-14 10:00+01'),
  ('00000000-0000-4000-8000-000000000e05', '00000000-0000-4000-8000-000000000403', 'pending',   'confirmed', '00000000-0000-4000-8000-0000000000a3', '2026-03-18 14:05+01'),
  ('00000000-0000-4000-8000-000000000e06', '00000000-0000-4000-8000-000000000403', 'confirmed', 'completed', '00000000-0000-4000-8000-0000000000a3', '2026-04-14 10:00+01'),
  ('00000000-0000-4000-8000-000000000e07', '00000000-0000-4000-8000-000000000404', 'pending',   'confirmed', '00000000-0000-4000-8000-0000000000a3', '2026-02-20 09:00+01'),
  ('00000000-0000-4000-8000-000000000e08', '00000000-0000-4000-8000-000000000404', 'confirmed', 'completed', '00000000-0000-4000-8000-0000000000a3', '2026-03-29 09:00+01'),
  ('00000000-0000-4000-8000-000000000e09', '00000000-0000-4000-8000-000000000405', 'pending',   'confirmed', '00000000-0000-4000-8000-0000000000a3', '2026-03-12 11:00+01'),
  ('00000000-0000-4000-8000-000000000e0a', '00000000-0000-4000-8000-000000000405', 'confirmed', 'completed', '00000000-0000-4000-8000-0000000000a3', '2026-04-07 09:00+01'),
  ('00000000-0000-4000-8000-000000000e0b', '00000000-0000-4000-8000-000000000406', 'pending',   'confirmed', '00000000-0000-4000-8000-0000000000a3', '2026-03-12 11:00+01'),
  ('00000000-0000-4000-8000-000000000e0c', '00000000-0000-4000-8000-000000000406', 'confirmed', 'completed', '00000000-0000-4000-8000-0000000000a3', '2026-04-07 09:00+01'),
  ('00000000-0000-4000-8000-000000000e0d', '00000000-0000-4000-8000-000000000407', 'pending',   'confirmed', '00000000-0000-4000-8000-0000000000a5', '2026-04-01 15:00+01'),
  ('00000000-0000-4000-8000-000000000e0e', '00000000-0000-4000-8000-000000000407', 'confirmed', 'completed', '00000000-0000-4000-8000-0000000000a5', '2026-04-15 12:00+01'),
  ('00000000-0000-4000-8000-000000000e0f', '00000000-0000-4000-8000-000000000408', 'pending',   'confirmed', '00000000-0000-4000-8000-0000000000a5', '2026-04-01 15:05+01'),
  ('00000000-0000-4000-8000-000000000e10', '00000000-0000-4000-8000-000000000408', 'confirmed', 'completed', '00000000-0000-4000-8000-0000000000a5', '2026-04-15 12:00+01'),
  ('00000000-0000-4000-8000-000000000e11', '00000000-0000-4000-8000-000000000409', 'pending',   'confirmed', '00000000-0000-4000-8000-0000000000a3', '2026-04-10 10:00+01'),
  ('00000000-0000-4000-8000-000000000e12', '00000000-0000-4000-8000-000000000409', 'confirmed', 'completed', '00000000-0000-4000-8000-0000000000a3', '2026-05-04 09:00+01'),
  ('00000000-0000-4000-8000-000000000e13', '00000000-0000-4000-8000-00000000040a', 'pending',   'confirmed', '00000000-0000-4000-8000-0000000000a4', '2026-05-05 16:00+01'),
  ('00000000-0000-4000-8000-000000000e14', '00000000-0000-4000-8000-00000000040a', 'confirmed', 'completed', '00000000-0000-4000-8000-0000000000a4', '2026-05-21 09:00+01'),
  -- confirmed bookings: one transition each
  ('00000000-0000-4000-8000-000000000e15', '00000000-0000-4000-8000-00000000040b', 'pending',   'confirmed', '00000000-0000-4000-8000-0000000000a3', '2026-06-25 10:00+01'),
  ('00000000-0000-4000-8000-000000000e16', '00000000-0000-4000-8000-00000000040c', 'pending',   'confirmed', '00000000-0000-4000-8000-0000000000a3', '2026-06-25 10:05+01'),
  ('00000000-0000-4000-8000-000000000e17', '00000000-0000-4000-8000-00000000040d', 'pending',   'confirmed', '00000000-0000-4000-8000-0000000000a3', '2026-06-28 12:00+01'),
  ('00000000-0000-4000-8000-000000000e18', '00000000-0000-4000-8000-00000000040e', 'pending',   'confirmed', '00000000-0000-4000-8000-0000000000a2', '2026-07-01 09:30+01'),
  -- cancelled booking: confirmed then cancelled
  ('00000000-0000-4000-8000-000000000e19', '00000000-0000-4000-8000-000000000414', 'pending',   'confirmed', '00000000-0000-4000-8000-0000000000a4', '2026-05-15 10:00+01'),
  ('00000000-0000-4000-8000-000000000e1a', '00000000-0000-4000-8000-000000000414', 'confirmed', 'cancelled', '00000000-0000-4000-8000-0000000000a4', '2026-06-02 17:00+01')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Payments — commission math is exact everywhere (checked by table constraint):
--   commission = gross * 20 / 100, net = gross - commission
-- Created by md (Tife) since bookers cannot process payments.
-- ----------------------------------------------------------------------------
insert into public.payments
  (id, booking_id, talent_id, gross_fee, commission_rate, commission_amount,
   net_talent_payment, currency, status, client_payment_date, talent_payment_date,
   invoice_number, notes, created_by)
values
  ('00000000-0000-4000-8000-000000000501', '00000000-0000-4000-8000-000000000401',
   '00000000-0000-4000-8000-000000000201', 600000.00, 20.00, 120000.00, 480000.00,
   'NGN', 'talent_paid', '2026-04-24', '2026-04-28', 'INV-2026-001', 'LFW runway — Zara.', '00000000-0000-4000-8000-0000000000a2'),
  ('00000000-0000-4000-8000-000000000502', '00000000-0000-4000-8000-000000000402',
   '00000000-0000-4000-8000-000000000203', 600000.00, 20.00, 120000.00, 480000.00,
   'NGN', 'talent_paid', '2026-04-24', '2026-04-28', 'INV-2026-002', 'LFW runway — Atlas.', '00000000-0000-4000-8000-0000000000a2'),
  ('00000000-0000-4000-8000-000000000503', '00000000-0000-4000-8000-000000000403',
   '00000000-0000-4000-8000-000000000206', 600000.00, 20.00, 120000.00, 480000.00,
   'NGN', 'talent_paid', '2026-04-24', '2026-04-28', 'INV-2026-003', 'LFW runway — Storm.', '00000000-0000-4000-8000-0000000000a2'),
  ('00000000-0000-4000-8000-000000000504', '00000000-0000-4000-8000-000000000404',
   '00000000-0000-4000-8000-000000000201', 450000.00, 20.00, 90000.00, 360000.00,
   'NGN', 'client_paid', '2026-04-20', null, 'INV-2026-004', 'Ziva editorial — client paid late (Net 14 breached).', '00000000-0000-4000-8000-0000000000a2'),
  ('00000000-0000-4000-8000-000000000505', '00000000-0000-4000-8000-000000000405',
   '00000000-0000-4000-8000-000000000202', 600000.00, 20.00, 120000.00, 480000.00,
   'NGN', 'client_paid', '2026-04-18', null, 'INV-2026-005', null, '00000000-0000-4000-8000-0000000000a2'),
  ('00000000-0000-4000-8000-000000000506', '00000000-0000-4000-8000-000000000406',
   '00000000-0000-4000-8000-000000000203', 600000.00, 20.00, 120000.00, 480000.00,
   'NGN', 'client_paid', '2026-04-18', null, 'INV-2026-006', null, '00000000-0000-4000-8000-0000000000a2'),
  ('00000000-0000-4000-8000-000000000507', '00000000-0000-4000-8000-000000000407',
   '00000000-0000-4000-8000-000000000201', 656250.00, 20.00, 131250.00, 525000.00,
   'NGN', 'talent_paid', '2026-04-25', '2026-04-30', 'INV-2026-007', 'Afropolitan cover — net 525,000 posted.', '00000000-0000-4000-8000-0000000000a2'),
  ('00000000-0000-4000-8000-000000000508', '00000000-0000-4000-8000-000000000408',
   '00000000-0000-4000-8000-000000000208', 400000.00, 20.00, 80000.00, 320000.00,
   'NGN', 'awaiting_client_payment', null, null, 'INV-2026-008', null, '00000000-0000-4000-8000-0000000000a2'),
  ('00000000-0000-4000-8000-000000000509', '00000000-0000-4000-8000-000000000409',
   '00000000-0000-4000-8000-000000000202', 2000000.00, 20.00, 400000.00, 1600000.00,
   'NGN', 'awaiting_client_payment', null, null, 'INV-2026-009', 'Pepsi TVC — 100% upfront terms, invoice issued.', '00000000-0000-4000-8000-0000000000a2'),
  ('00000000-0000-4000-8000-00000000050a', '00000000-0000-4000-8000-00000000040a',
   '00000000-0000-4000-8000-00000000020a', 3000.00, 20.00, 600.00, 2400.00,
   'USD', 'talent_paid', '2026-05-22', '2026-05-29', 'INV-2026-010', 'Zenith diaspora campaign — USD payout.', '00000000-0000-4000-8000-0000000000a2'),
  ('00000000-0000-4000-8000-00000000050b', '00000000-0000-4000-8000-00000000040e',
   '00000000-0000-4000-8000-000000000207', 1200.00, 20.00, 240.00, 960.00,
   'GBP', 'awaiting_client_payment', null, null, 'INV-2026-011', 'Vogue Afrique London — invoiced ahead of shoot.', '00000000-0000-4000-8000-0000000000a2')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Notifications (direct rows have talent_id; broadcast row 0607 has null
-- talent_id + rows in notification_recipients)
-- ----------------------------------------------------------------------------
insert into public.notifications
  (id, talent_id, sender_id, type, title, body, booking_id, is_read,
   requires_response, response_status, response_text, responded_at,
   escalated, escalated_at, created_at)
values
  ('00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000203',
   '00000000-0000-4000-8000-0000000000a3', 'availability_check',
   'Availability check — Vogue Afrique editorial',
   'Are you available for an editorial shoot on August 10-11, 2026? Location: Lagos studio.',
   null, true, true, 'accepted', 'Available both days.', '2026-06-28 11:15+01',
   false, null, '2026-06-27 10:30+01'),

  -- Escalated: sent to Muse, no response within 10 hours.
  ('00000000-0000-4000-8000-000000000602', '00000000-0000-4000-8000-000000000207',
   '00000000-0000-4000-8000-0000000000a2', 'availability_check',
   'Availability check — Vogue Afrique London editorial',
   'Are you available for a portfolio editorial on August 3, 2026 in Shoreditch?',
   '00000000-0000-4000-8000-00000000040e', false, true, 'pending', null, null,
   true, '2026-07-05 18:00+01', '2026-07-05 08:00+01'),

  ('00000000-0000-4000-8000-000000000603', '00000000-0000-4000-8000-000000000201',
   '00000000-0000-4000-8000-0000000000a3', 'booking_update',
   'Booking confirmed — Vlisco SS26 Heritage Campaign',
   'Your booking for the Vlisco SS26 campaign has been confirmed. Dates: July 20-21, 2026. Call time 7:30 AM, Vlisco Showroom, Lekki Phase 1.',
   '00000000-0000-4000-8000-00000000040b', true, true, 'accepted', null, '2026-06-25 12:40+01',
   false, null, '2026-06-25 10:10+01'),

  ('00000000-0000-4000-8000-000000000604', '00000000-0000-4000-8000-000000000201',
   '00000000-0000-4000-8000-0000000000a4', 'payment_update',
   'Payment received — Afropolitan Magazine cover',
   'Payment of NGN 525,000 (net of 20% commission on NGN 656,250) has been deposited for the Afropolitan cover story.',
   '00000000-0000-4000-8000-000000000407', true, false, 'no_response', null, null,
   false, null, '2026-04-30 09:00+01'),

  ('00000000-0000-4000-8000-000000000605', '00000000-0000-4000-8000-000000000202',
   '00000000-0000-4000-8000-0000000000a3', 'portfolio_request',
   'Portfolio update required — new digitals',
   'Please attend the studio session for updated digitals. We need front, side, and back shots in natural light.',
   null, false, true, 'pending', null, null,
   false, null, '2026-07-06 15:00+01'),

  ('00000000-0000-4000-8000-000000000606', '00000000-0000-4000-8000-000000000201',
   '00000000-0000-4000-8000-0000000000a3', 'pre_job_brief',
   'Pre-job brief — Vlisco SS26 fitting',
   'Fitting is 14 July at 2pm, Vlisco Showroom Lekki. Full brief sent to your email; call sheet drops next week.',
   '00000000-0000-4000-8000-00000000040b', true, true, 'confirmed', null, '2026-07-02 17:20+01',
   false, null, '2026-07-02 11:00+01'),

  -- Broadcast announcement (recipients in notification_recipients below).
  ('00000000-0000-4000-8000-000000000607', null,
   '00000000-0000-4000-8000-0000000000a1', 'announcement',
   'Agency update — summer office hours',
   'The Lagos office runs reduced hours July 15 to August 15. For urgent booking matters, contact Aliyu on WhatsApp.',
   null, false, false, 'no_response', null, null,
   false, null, '2026-07-01 10:00+01'),

  ('00000000-0000-4000-8000-000000000608', '00000000-0000-4000-8000-000000000209',
   '00000000-0000-4000-8000-0000000000a3', 'booking_update',
   'New booking — Pepsi Social Content Series',
   'Pepsi Nigeria has confirmed the social content series for July 25, 2026 at the Pepsi Content Lab, Ikeja. Six short-form videos.',
   '00000000-0000-4000-8000-00000000040d', true, true, 'accepted', null, '2026-06-28 14:00+01',
   false, null, '2026-06-28 12:30+01'),

  ('00000000-0000-4000-8000-000000000609', '00000000-0000-4000-8000-000000000205',
   '00000000-0000-4000-8000-0000000000a5', 'general',
   'Welcome to Candor — onboarding next steps',
   'Welcome to the roster! Your welcome agreement is in your Documents. Your first comp card shoot will be scheduled this month.',
   null, true, false, 'no_response', null, null,
   false, null, '2026-06-20 09:00+01')
on conflict (id) do nothing;

-- Recipients for broadcast 0607 (all active, public-facing talent).
insert into public.notification_recipients
  (id, notification_id, talent_id, is_read, response_status)
values
  ('00000000-0000-4000-8000-000000000f01', '00000000-0000-4000-8000-000000000607',
   '00000000-0000-4000-8000-000000000201', true,  'no_response'),
  ('00000000-0000-4000-8000-000000000f02', '00000000-0000-4000-8000-000000000607',
   '00000000-0000-4000-8000-000000000202', true,  'no_response'),
  ('00000000-0000-4000-8000-000000000f03', '00000000-0000-4000-8000-000000000607',
   '00000000-0000-4000-8000-000000000203', false, 'no_response'),
  ('00000000-0000-4000-8000-000000000f04', '00000000-0000-4000-8000-000000000607',
   '00000000-0000-4000-8000-000000000206', false, 'no_response'),
  ('00000000-0000-4000-8000-000000000f05', '00000000-0000-4000-8000-000000000607',
   '00000000-0000-4000-8000-000000000209', true,  'no_response'),
  ('00000000-0000-4000-8000-000000000f06', '00000000-0000-4000-8000-000000000607',
   '00000000-0000-4000-8000-00000000020a', false, 'no_response')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Documents
-- ----------------------------------------------------------------------------
insert into public.documents
  (id, talent_id, title, document_type, file_url, is_personalised,
   date_signed, booking_id, uploaded_by)
values
  ('00000000-0000-4000-8000-000000000701', '00000000-0000-4000-8000-000000000201',
   'Talent Management Agreement — Ayotomiwa Durojaye', 'management_agreement',
   '/documents/agreement_zara_2025.pdf', true, '2025-06-15', null,
   '00000000-0000-4000-8000-0000000000a5'),
  ('00000000-0000-4000-8000-000000000702', '00000000-0000-4000-8000-000000000202',
   'Talent Management Agreement — John Smith', 'management_agreement',
   '/documents/agreement_phoenix_2025.pdf', true, '2025-04-20', null,
   '00000000-0000-4000-8000-0000000000a5'),
  ('00000000-0000-4000-8000-000000000703', '00000000-0000-4000-8000-000000000203',
   'Talent Management Agreement — Chioma Nwosu', 'management_agreement',
   '/documents/agreement_atlas_2025.pdf', true, '2025-05-10', null,
   '00000000-0000-4000-8000-0000000000a5'),
  ('00000000-0000-4000-8000-000000000704', '00000000-0000-4000-8000-000000000204',
   'Welcome Agreement — Emeka Okafor', 'welcome_agreement',
   '/documents/welcome_blaze_2026.pdf', true, '2026-02-28', null,
   '00000000-0000-4000-8000-0000000000a5'),
  ('00000000-0000-4000-8000-000000000705', '00000000-0000-4000-8000-000000000201',
   'Booking Confirmation — Lagos Fashion Week Runway', 'booking_confirmation',
   '/documents/deal_memo_lfw_runway_2026.pdf', true, '2026-03-19',
   '00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000706', '00000000-0000-4000-8000-000000000202',
   'Booking Confirmation — GTBank Annual Report', 'booking_confirmation',
   '/documents/deal_memo_gtbank_2026.pdf', true, '2026-03-13',
   '00000000-0000-4000-8000-000000000405', '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000707', '00000000-0000-4000-8000-000000000201',
   'Call Sheet — Lagos Fashion Week', 'call_sheet',
   '/documents/call_sheet_lfw_apr2026.pdf', false, null,
   '00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000708', '00000000-0000-4000-8000-000000000203',
   'Payment Statement — Q1 2026', 'payment_statement',
   '/documents/statement_atlas_q1_2026.pdf', true, null, null,
   '00000000-0000-4000-8000-0000000000a4'),
  ('00000000-0000-4000-8000-000000000709', '00000000-0000-4000-8000-000000000206',
   'Candor Code of Conduct', 'code_of_conduct',
   '/documents/candor_code_of_conduct_2026.pdf', false, '2025-08-01', null,
   '00000000-0000-4000-8000-0000000000a5')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Open castings — public copy carries NO brand names; client_id and
-- brand_name_internal are the internal linkage.
-- ----------------------------------------------------------------------------
insert into public.open_castings
  (id, title, description, category, location, shoot_date_start, shoot_date_end,
   work_type, media_usage, requirements, deadline, status,
   client_id, brand_name_internal, created_by)
values
  ('00000000-0000-4000-8000-000000000801',
   'Editorial shoot — luxury fashion title',
   'Seeking female models for a high-end editorial spread. Must be comfortable with minimal styling and natural beauty looks.',
   'model', 'lagos', '2026-08-10', '2026-08-11', 'Editorial', 'Print',
   'Female, 175cm+, size 6-8', '2026-07-15 18:00+01', 'open',
   '00000000-0000-4000-8000-000000000305', 'Vogue Afrique',
   '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000802',
   'TVC campaign — youth energy brand',
   'Dynamic young talent needed for a high-energy TVC. Looking for charismatic individuals with natural screen presence.',
   'model', 'lagos', '2026-08-01', '2026-08-03', 'TVC', 'TV + digital + social',
   'Male or female, 20-28 years, energetic', '2026-07-20 18:00+01', 'open',
   '00000000-0000-4000-8000-000000000304', 'Pepsi Nigeria',
   '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000803',
   'Runway — new faces showcase',
   'New and emerging talent showcase at a major Lagos fashion event. Great opportunity for new faces to gain runway experience.',
   'model', 'lagos', '2026-09-05', '2026-09-05', 'Runway', 'Social media + press',
   'New faces, all genders, 170cm+', '2026-08-20 18:00+01', 'open',
   '00000000-0000-4000-8000-000000000301', 'Lagos Fashion Week',
   '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000804',
   'Corporate portraits — annual report',
   'Professional corporate headshots and lifestyle shots for a banking annual report.',
   'model', 'lagos', '2026-04-05', '2026-04-06', 'Commercial', 'Print + digital',
   'Male and female, professional look', '2026-03-28 18:00+01', 'closed',
   '00000000-0000-4000-8000-000000000302', 'GTBank',
   '00000000-0000-4000-8000-0000000000a3'),
  ('00000000-0000-4000-8000-000000000805',
   'SS26 campaign — heritage textiles',
   'Global textile house shooting a four-talent heritage campaign in Lagos. Print, digital and OOH usage.',
   'model', 'lagos', '2026-07-20', '2026-07-21', 'Commercial', 'Print + digital + OOH',
   'Female, editorial range, comfortable with bold prints', '2026-06-20 18:00+01', 'closed',
   '00000000-0000-4000-8000-000000000306', 'Vlisco',
   '00000000-0000-4000-8000-0000000000a3')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Casting interests (calendar conflicts reference real seed bookings)
-- ----------------------------------------------------------------------------
insert into public.casting_interests
  (id, casting_id, talent_id, response, calendar_conflict, conflict_details,
   shortlisted, selected, created_at)
values
  -- 0801 Vogue editorial (open)
  ('00000000-0000-4000-8000-000000000901', '00000000-0000-4000-8000-000000000801',
   '00000000-0000-4000-8000-000000000201', 'interested', false, null, true, false, '2026-07-02 10:00+01'),
  ('00000000-0000-4000-8000-000000000902', '00000000-0000-4000-8000-000000000801',
   '00000000-0000-4000-8000-000000000203', 'interested', true, 'You have a pending booking on August 10',
   false, false, '2026-07-02 11:00+01'),
  -- 0802 Pepsi TVC (open)
  ('00000000-0000-4000-8000-000000000903', '00000000-0000-4000-8000-000000000802',
   '00000000-0000-4000-8000-000000000202', 'interested', false, null, false, false, '2026-07-03 09:00+01'),
  ('00000000-0000-4000-8000-000000000904', '00000000-0000-4000-8000-000000000802',
   '00000000-0000-4000-8000-000000000209', 'interested', false, null, true, false, '2026-07-03 14:30+01'),
  -- 0803 LFW new faces (open)
  ('00000000-0000-4000-8000-000000000905', '00000000-0000-4000-8000-000000000803',
   '00000000-0000-4000-8000-000000000205', 'interested', false, null, true, false, '2026-07-04 14:00+01'),
  ('00000000-0000-4000-8000-000000000906', '00000000-0000-4000-8000-000000000803',
   '00000000-0000-4000-8000-000000000204', 'interested', false, null, true, false, '2026-07-05 08:00+01'),
  -- 0804 GTBank portraits (closed; selections became bookings 0405/0406)
  ('00000000-0000-4000-8000-000000000907', '00000000-0000-4000-8000-000000000804',
   '00000000-0000-4000-8000-000000000202', 'interested', false, null, true, true, '2026-03-10 09:00+01'),
  ('00000000-0000-4000-8000-000000000908', '00000000-0000-4000-8000-000000000804',
   '00000000-0000-4000-8000-000000000203', 'interested', false, null, true, true, '2026-03-10 10:00+01'),
  ('00000000-0000-4000-8000-000000000909', '00000000-0000-4000-8000-000000000804',
   '00000000-0000-4000-8000-000000000206', 'not_available', true, 'You have a booking on April 5',
   false, false, '2026-03-10 11:00+01'),
  -- 0805 Vlisco SS26 (closed; selections became bookings 040b/040c)
  ('00000000-0000-4000-8000-00000000090a', '00000000-0000-4000-8000-000000000805',
   '00000000-0000-4000-8000-000000000201', 'interested', false, null, true, true, '2026-06-10 10:00+01'),
  ('00000000-0000-4000-8000-00000000090b', '00000000-0000-4000-8000-000000000805',
   '00000000-0000-4000-8000-000000000203', 'interested', false, null, true, true, '2026-06-10 12:00+01')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Milestones — mix of approved/published and pending, named and anonymous
-- ----------------------------------------------------------------------------
insert into public.milestones
  (id, talent_id, booking_id, visibility, display_text, admin_approved,
   approved_by, is_published, created_at)
values
  ('00000000-0000-4000-8000-000000000a01', '00000000-0000-4000-8000-000000000201',
   '00000000-0000-4000-8000-000000000401', 'named',
   'Zara walked Lagos Fashion Week — another milestone for the Candor family!',
   true, '00000000-0000-4000-8000-0000000000a5', true, '2026-03-18 15:00+01'),
  ('00000000-0000-4000-8000-000000000a02', '00000000-0000-4000-8000-000000000203',
   '00000000-0000-4000-8000-000000000406', 'anonymous',
   'One of our talent just wrapped a major banking campaign — congratulations!',
   true, '00000000-0000-4000-8000-0000000000a5', true, '2026-03-11 09:00+01'),
  ('00000000-0000-4000-8000-000000000a03', '00000000-0000-4000-8000-000000000206',
   '00000000-0000-4000-8000-000000000403', 'named',
   'Storm walks Lagos Fashion Week! Proud moment for the team.',
   false, null, false, '2026-03-18 15:30+01'),
  ('00000000-0000-4000-8000-000000000a04', '00000000-0000-4000-8000-000000000203',
   '00000000-0000-4000-8000-000000000402', 'named',
   'Atlas confirmed for Lagos Fashion Week! Keep soaring.',
   false, null, false, '2026-03-18 16:00+01'),
  ('00000000-0000-4000-8000-000000000a05', '00000000-0000-4000-8000-000000000201',
   '00000000-0000-4000-8000-00000000040b', 'named',
   'Zara books the Vlisco SS26 heritage campaign!',
   false, null, false, '2026-06-25 13:00+01')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- AI assistant conversations (messages as jsonb arrays)
-- ----------------------------------------------------------------------------
insert into public.ai_conversations (id, talent_id, messages) values
  ('00000000-0000-4000-8000-000000000d01', '00000000-0000-4000-8000-000000000201',
   '[
      {"role": "user", "content": "When is my next booking?", "timestamp": "2026-07-05T09:12:00+01:00"},
      {"role": "assistant", "content": "Your next booking is the Vlisco SS26 Heritage Campaign on 20-21 July 2026, call time 7:30 AM at the Vlisco Showroom, Lekki Phase 1.", "timestamp": "2026-07-05T09:12:04+01:00"},
      {"role": "user", "content": "Has the Afropolitan payment landed?", "timestamp": "2026-07-05T09:13:10+01:00"},
      {"role": "assistant", "content": "Yes — NGN 525,000 (net of 20% commission) was deposited on 30 April 2026.", "timestamp": "2026-07-05T09:13:14+01:00"}
    ]'::jsonb),
  ('00000000-0000-4000-8000-000000000d02', '00000000-0000-4000-8000-000000000202',
   '[
      {"role": "user", "content": "What does the portfolio request mean?", "timestamp": "2026-07-06T16:02:00+01:00"},
      {"role": "assistant", "content": "The agency has asked for updated digitals: front, side, and back shots in natural light. Confirm the notification and Aliyu will book your studio slot.", "timestamp": "2026-07-06T16:02:05+01:00"}
    ]'::jsonb)
on conflict (id) do nothing;
