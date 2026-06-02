---
name: MedDrive Core
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#424752'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#727783'
  outline-variant: '#c2c6d4'
  surface-tint: '#005db6'
  primary: '#00478d'
  on-primary: '#ffffff'
  primary-container: '#005eb8'
  on-primary-container: '#c8daff'
  inverse-primary: '#a9c7ff'
  secondary: '#006e25'
  on-secondary: '#ffffff'
  secondary-container: '#80f98b'
  on-secondary-container: '#007327'
  tertiary: '#793100'
  on-tertiary: '#ffffff'
  tertiary-container: '#9f4300'
  on-tertiary-container: '#ffcfb9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#a9c7ff'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#00468c'
  secondary-fixed: '#83fc8e'
  secondary-fixed-dim: '#66df75'
  on-secondary-fixed: '#002106'
  on-secondary-fixed-variant: '#00531a'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb691'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#793100'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  margin-mobile: 16px
  gutter-mobile: 12px
  touch-target-min: 48px
---

## Brand & Style

The design system is engineered for the high-stakes environment of medical transport (Krankentransport). The brand personality is **Professional, Functional, and Authoritative**, prioritizing utility over ornamentation. It targets transport drivers who require immediate data recognition and error-free interaction while in a vehicle or during patient handovers.

The design style is **Corporate / Modern** with a heavy emphasis on high-contrast accessibility. It utilizes a systematic approach to information density, ensuring that critical patient data and trip statuses are never obscured. The emotional response should be one of reliability and calm efficiency, reducing the cognitive load on the driver through clear visual hierarchies and a predictable interface.

## Colors

The palette is anchored by **Medical Blue (#005EB8)**, establishing immediate trust and professional alignment with healthcare standards. 

- **Primary:** Used for the main action buttons (e.g., "Fahrt starten") and active navigation states.
- **Secondary (Success):** Reserved for confirmation states, completed trip legs, and successful document scans.
- **Warning:** Utilized specifically for data verification needs or "Achtung" prompts requiring driver attention.
- **Neutrals:** A range of cool grays provides separation between content blocks. The background is a clean white to ensure maximum contrast against dark text.
- **Semantic Logic:** Every color carries functional meaning. Use color sparingly to highlight actionable status changes or critical patient alerts.

## Typography

This design system uses **Inter** for its exceptional legibility at small sizes and its neutral, systematic tone. Typography is scaled up to accommodate drivers who may be viewing the screen at arm's length (e.g., mounted on a dashboard).

- **High Contrast:** Ensure a minimum contrast ratio of 4.5:1 for all text.
- **Readability:** Body text starts at 16px, but 18px is preferred for patient notes and addresses.
- **Scannability:** Bold weights (600+) are used for key data points like patient names ("Patientenname") and pickup times ("Abholzeit").
- **Language Support:** All styles support German-specific characters (Ä, Ö, Ü, ß) without clipping or line-height issues.

## Layout & Spacing

The layout follows a **Fluid Grid** model optimized for mobile handsets. Since the app is used in high-motion environments, spacing is generous to prevent accidental taps.

- **Grid:** A 4-column layout for mobile with 16px side margins.
- **Touch Targets:** No interactive element (button, checkbox, or link) should be smaller than 48x48px.
- **Vertical Rhythm:** Content blocks (Trip cards) are separated by 16px (md) to 24px (lg) spacing to ensure clear distinction between different transport orders.
- **Safe Areas:** Adhere to system-level safe areas for notches and home indicators to ensure navigation elements remain unobstructed.

## Elevation & Depth

This design system uses **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows to maintain a clean, clinical aesthetic.

- **Base Level:** The background is white (#FFFFFF) or light gray (#F8F9FA).
- **Surface Level:** Cards and modal containers use a white surface with a 1px border (#E9ECEF) to define boundaries.
- **Active Elevation:** Only the most critical actionable elements (like the primary "Start" button) may use a soft, subtle ambient shadow (Blur 8px, Opacity 10%, Primary Color Tint) to suggest interactability.
- **Depth:** High-priority alerts or verification prompts appear in modals that dim the background, focusing the driver’s attention entirely on the verification task.

## Shapes

The shape language is **Rounded**, utilizing a 0.5rem (8px) base radius. This strikes a balance between professional precision and a modern, approachable feel.

- **Buttons:** Use `rounded-lg` (16px) or full pills for primary actions to distinguish them from informational cards.
- **Cards:** Use the base `rounded` (8px) to contain trip and patient data.
- **Input Fields:** Standardized 8px radius to maintain consistency across forms.
- **Scanner Overlays:** The bounding box for the scanner should have slightly more pronounced corners (12px) to frame document edges effectively.

## Components

The components of this design system are built for speed and accuracy in high-stress medical environments.

### Buttons
- **Primary:** Solid #005EB8 with white text. Minimum height 56px for easy tapping.
- **Secondary:** Outlined with 2px stroke in #005EB8.
- **Destructive:** Solid #D62727 for "Fahrt abbrechen" (Cancel Trip).

### Trip Cards
- Summary of the current order. Title-lg for the patient name.
- Status indicators (e.g., "Unterwegs", "Abgeschlossen") use a chip-style component with background colors corresponding to the semantic logic (Blue/Green).

### Input Fields & Verification
- Fields must include clear, persistent labels (Label-lg).
- Error states must use #D62727 with an icon for visibility.
- Data verification fields (e.g., insurance numbers) should include a "Verify" button directly within the field suffix.

### Scanner Overlay
- A semi-transparent dark overlay with a clear, high-contrast bounding box in the center.
- Corner guides in #28A745 (Success) when a document is detected.
- Real-time tooltips (e.g., "Bitte Dokument ruhig halten") in a center-aligned label.

### Status Indicators
- Large, colored bars at the top of the screen to indicate global state (e.g., "Active Trip" vs "Waiting for Order").