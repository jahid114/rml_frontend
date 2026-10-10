import { z } from 'zod';

export const roleSchema = z.enum([
  'director',
  'research-fellow',
  'research-associate',
  'researcher',
  'research-assistant-full-time',
  'research-assistant-part-time',
  'non-resident-fellow',
  'research-affiliate',
]);

export const personSchema = z.object({
  id: z.string(),
  slug: z.string().min(1, 'Slug is required'),
  name: z.string().min(1, 'Name is required'),
  role: roleSchema,
  title: z.string().min(1, 'Title is required'),
  affiliation: z.string().min(1, 'Affiliation is required'),
  secondaryAffiliation: z.string().optional(),
  photoUrl: z.string().min(1, 'Photo is required'),
  profileUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  bio: z.string().optional(),
  order: z.number().int().default(0),
  featured: z.boolean().default(false),
  status: z.enum(['draft', 'published']).default('draft'),
});

export const publicationTypeSchema = z.enum([
  'book',
  'journal-article',
  'policy-paper',
  'chapter',
]);

export const publicationSchema = z.object({
  id: z.string(),
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  type: publicationTypeSchema,
  coverImageUrl: z.string().min(1, 'Cover image is required'),
  description: z.string().min(1, 'Description is required'),
  authors: z.array(z.string()).min(1, 'At least one author is required'),
  year: z.number().int().min(1900, 'Enter a valid year').max(2100),
  externalUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  status: z.enum(['draft', 'published']).default('draft'),
});

export const eventPanelistSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  photoUrl: z.string().optional(),
  bio: z.string().min(1, 'Bio is required'),
  profileUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  isModerator: z.boolean().optional(),
});

export const eventTimezoneSchema = z.object({
  label: z.string().min(1, 'Label required'),
  time: z.string().min(1, 'Time required'),
});

export const eventSocialLinkSchema = z.object({
  platform: z.string().min(1, 'Platform required'),
  url: z.string().url('Must be a valid URL'),
});

export const eventSchema = z.object({
  id: z.string(),
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  theme: z.string().min(1, 'Theme is required'),
  description: z.string().min(1, 'Description is required'),
  coverImageUrl: z.string().min(1, 'Cover image is required'),
  status: z.enum(['upcoming', 'past']),
  eventFormat: z.enum(['in-person', 'virtual', 'hybrid']),
  startDateTimeUtc: z.string().min(1, 'Date/time required'),
  timezoneLabels: z.array(eventTimezoneSchema).default([]),
  organizer: z.string().min(1, 'Organizer required'),
  collaborators: z.string().optional(),
  panelists: z.array(eventPanelistSchema).default([]),
  registrationUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  recordingUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  socialLinks: z.array(eventSocialLinkSchema).optional(),
});

export const jobOpeningSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  summary: z.string().min(1, 'Summary is required'),
  richDescription: z.string().min(1, 'Description is required'),
  applyUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  applyEmail: z.string().email('Must be a valid email').optional().or(z.literal('')),
  deadline: z.string().optional(),
  status: z.enum(['open', 'closed']).default('open'),
  featuredOnHome: z.boolean().default(false),
});

export const researchThemeSchema = z.object({
  id: z.string(),
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  summary: z.string().min(1, 'Summary is required'),
  body: z.string().min(1, 'Body is required'),
  coverImageUrl: z.string().min(1, 'Cover image is required'),
  relatedPublicationIds: z.array(z.string()).optional(),
  relatedPersonIds: z.array(z.string()).optional(),
});

export const whatWeDoItemSchema = z.object({
  icon: z.string().min(1, 'Icon name required'),
  label: z.string().min(1, 'Label required'),
  text: z.string().min(1, 'Text required'),
});

export const heroSlideSchema = z.object({
  imageUrl: z.string().min(1, 'Slide image required'),
  eyebrow: z.string().min(1, 'Eyebrow required'),
  title: z.string().min(1, 'Title required'),
  description: z.string().min(1, 'Description required'),
  ctaLabel: z.string().min(1, 'CTA label required'),
  ctaUrl: z.string().min(1, 'CTA URL required'),
});

export const homeContentSchema = z.object({
  heroSlides: z.array(heroSlideSchema).min(1, 'At least one hero slide is required'),
  includeEventSlide: z.boolean().default(true),
  purposeKicker: z.string().min(1, 'Kicker required'),
  purposeQuote: z.string().min(1, 'Quote required'),
  purposeHeading: z.string().min(1, 'Heading required'),
  missionText: z.string().min(1, 'Mission text required'),
  purposeCtaLabel: z.string().min(1, 'CTA label required'),
  whatWeDoKicker: z.string().min(1, 'Kicker required'),
  whatWeDoHeading: z.string().min(1, 'Heading required'),
  whatWeDoIntro: z.string().min(1, 'Intro required'),
  whatWeDoItems: z.array(whatWeDoItemSchema).max(4, 'Maximum 4 items'),
  eventsKicker: z.string().min(1, 'Kicker required'),
  eventsHeading: z.string().min(1, 'Heading required'),
  eventsLinkLabel: z.string().min(1, 'Link label required'),
  featuredCardCtaLabel: z.string().min(1, 'CTA label required'),
  joinFallbackBadge: z.string().min(1, 'Badge required'),
  joinFallbackTitle: z.string().min(1, 'Title required'),
  joinFallbackText: z.string().min(1, 'Text required'),
  joinCtaLabel: z.string().min(1, 'CTA label required'),
  connectKicker: z.string().min(1, 'Kicker required'),
  connectHeading: z.string().min(1, 'Heading required'),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const aboutContentSchema = z.object({
  heroImageUrl: z.string().min(1, 'Hero image required'),
  introText: z.string().min(1, 'Intro required'),
  missionText: z.string().min(1, 'Mission text required'),
  whatWeDoKicker: z.string().optional(),
  whatWeDoHeading: z.string().optional(),
  whatWeDoIntro: z.string().optional(),
  whatWeDoItems: z.array(whatWeDoItemSchema).max(6, 'Maximum 6 items'),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const programmePageContentSchema = z.object({
  slug: z.enum(['internship', 'visiting-fellowship']),
  heroImageUrl: z.string().optional(),
  overviewText: z.string().min(1, 'Overview required'),
  eligibilityItems: z.array(z.string()).min(1, 'At least one eligibility item'),
  howToApplySteps: z.array(z.string()).min(1, 'At least one step'),
  ctaLabel: z.string().min(1, 'CTA label required'),
  ctaUrl: z.string().min(1, 'CTA URL required'),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const contactContentSchema = z.object({
  contactEmail: z.string().email('Must be a valid email'),
  institutionalLine: z.string().min(1, 'Institutional line required'),
  formEnabled: z.boolean().default(false),
});

export const siteSettingsSchema = z.object({
  logoUrl: z.string().min(1, 'Logo required'),
  faviconUrl: z.string().min(1, 'Favicon required'),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color like #1B2A4A'),
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color like #C1622B'),
  primaryColorDark: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color like #123F3F'),
  accentColorDark: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color like #C55A2A'),
  backgroundColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color like #f4f1e9'),
  backgroundColorDark: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color like #0e1616'),
  navLabels: z.record(z.string(), z.string()),
  socialLinks: z.array(
    z.object({ platform: z.string(), url: z.string().url('Must be a valid URL') })
  ),
  contactEmail: z.string().email('Must be a valid email'),
  footerText: z.string().min(1, 'Footer text required'),
});

export const mediaItemSchema = z.object({
  id: z.string(),
  url: z.string().min(1, 'URL required'),
  filename: z.string().min(1, 'Filename required'),
  altText: z.string().min(1, 'Alt text is required for accessibility'),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
});

export const adminRoleSchema = z.enum(['admin', 'editor']);

export const adminUserSchema = z.object({
  id: z.string(),
  email: z.string().email('Must be a valid email'),
  name: z.string().min(1, 'Name required'),
  role: adminRoleSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
