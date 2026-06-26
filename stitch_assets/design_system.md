---
name: Synthetica Dark
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#bcc7de'
  on-secondary: '#263143'
  secondary-container: '#3e495d'
  on-secondary-container: '#aeb9d0'
  tertiary: '#bec6e0'
  on-tertiary: '#283044'
  tertiary-container: '#8990a8'
  on-tertiary-container: '#22293d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  max-content-width: 1200px
---

## Brand & Style

This design system is engineered for high-performance AI RAG interfaces where clarity, focus, and technical precision are paramount. The personality is "Intelligent Professionalism"—it feels like a powerful tool rather than a toy.

The design style leverages **Modern Minimalist Glassmorphism**. By combining deep charcoal surfaces with frosted glass layers and vibrant electric blue accents, the UI achieves a sense of depth and hierarchy without visual clutter. The aesthetic emphasizes the "Retrieval" aspect of the product by using structured layouts that feel like an organized digital workspace.

## Colors

The palette is anchored in a deep dark-mode foundation to reduce eye strain during long research sessions.

- **Primary (#3B82F6):** Used exclusively for high-intent actions, active states, and user-originated content.
- **Background (#0F172A):** The base canvas. It provides a "bottomless" feel that allows UI elements to float.
- **Surface (#1E293B):** Used for primary containers, sidebars, and card elements to create structural separation.
- **Border (#334155):** A muted gray-blue used for low-contrast outlines that define boundaries without being harsh.
- **Typography:** Headlines use #F8FAFC (white-adjacent) for maximum contrast; body text uses #CBD5E1; secondary metadata uses #94A3B8.

## Typography

The system uses **Inter** as the primary typeface for its exceptional legibility in digital interfaces and its neutral, systematic feel. 

For technical data, citations, and RAG-specific metadata (like source file names or confidence scores), **JetBrains Mono** is introduced to provide a distinct "developer-friendly" and precise character. 

Hierarchy is established through tight letter spacing on large headings and generous line heights for body text to ensure that AI-generated responses are easy to scan and digest.

## Layout & Spacing

This design system utilizes a **Fluid Grid with Fixed Constraints**. While the interface expands to fill the screen, the main chat/content area is capped at a maximum width of 1200px to maintain line-length readability.

- **The 8px Rule:** All spacing between elements (margins, padding) must be multiples of 8px. Smaller 4px increments are reserved for tight component internal spacing.
- **Sidebar:** A fixed 280px width on desktop, collapsing into a slide-over drawer on mobile.
- **Reflow:** On mobile, side-by-side RAG sources move below the main chat thread.

## Elevation & Depth

Depth is established through **Glassmorphism** and **Tonal Layering** rather than traditional drop shadows.

- **Level 0 (Base):** #0F172A (The background).
- **Level 1 (Sub-surface):** #1E293B (Sidebars and subtle cards).
- **Level 2 (Glass Layer):** A semi-transparent overlay with a `backdrop-filter: blur(12px)` and a white-at-10% opacity fill. Used for the main input area and navigation bars.
- **Borders:** Instead of shadows, use 1px solid borders using the "Surface" color or a slightly lighter #334155 to define edges.
- **Active State:** A subtle inner glow using the Primary Blue at 15% opacity is used for focused inputs or active cards.

## Shapes

The shape language is professional and modern. Standard UI components (buttons, input fields, cards) use a **12px (rounded-lg)** radius. Larger structural elements like the main chat container or glass panels use a **16px (rounded-xl)** radius. 

Avoid fully circular "pill" shapes except for status indicators or small tags. The squared-off but softened corners communicate a balance between approachable software and technical rigor.

## Components

- **Buttons:** Primary buttons are solid #3B82F6 with white text. Secondary buttons use a transparent background with a 1px border. Use 12px corner radius.
- **Chat Bubbles:**
    - *User:* Solid Primary Blue (#3B82F6) with white text. Aligned right.
    - *Assistant:* Solid #1E293B with a subtle #334155 border. Aligned left.
- **Input Field:** Fixed to the bottom of the viewport with a glassmorphism effect (blur + 10% white tint). No heavy border; use a subtle inner stroke.
- **Chips/Citations:** Small, 8px rounded badges using JetBrains Mono. Use #1E293B background with a thin blue border when hovered.
- **Icons:** Use thin-stroke (1.5px or 2px) minimalist icons. Keep icon size consistent at 20px or 24px.
- **Source Cards:** Used for RAG results. These should feature a small "Type" icon (PDF, Doc, Web) and use a truncated preview of the retrieved text.
