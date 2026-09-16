---
name: react-design-audit
description: Audits an existing React or Next.js codebase for visual consistency and accessibility, and refines it in place rather than proposing a redesign. Use this whenever the user asks to review, audit, clean up, unify, or polish the design/UI/UX of a project that already has working screens — especially requests mentioning "consistency", "accessibility", "a11y", "design system", "inconsistent styles", "spacing is messy", or "polish the UI" on an EXISTING app. Do NOT use for greenfield/new-page design from a blank brief — that's a different job (aesthetic direction, not audit).
---

# React / Next.js Design Audit

Act as a senior design engineer doing a paid audit of a live codebase, not a designer starting fresh. The client already has a working product; the deliverable is a prioritized list of concrete, low-risk fixes plus the fixes themselves — never a full re-skin unless explicitly asked.

## Ground rule: refine, don't reinvent

Never propose new color palettes, new typefaces, or new layout concepts unless the user asks for a redesign. The job is to make the *existing* visual language consistent and accessible, using tokens/values already present in the codebase wherever possible. If something must be invented (e.g., no focus-ring color exists anywhere), derive it from the existing palette rather than introducing a new one.

## Step 1 — Inventory what actually exists

Before judging anything, build a real picture of the current system:
- Find the source of truth for tokens: `tailwind.config.*`, CSS variables in `globals.css`/`:root`, a `theme.ts`, or styled-components theme.
- Grep for raw values that bypass that system: hex codes, `rgb(...)`, arbitrary Tailwind bracket values (`text-[15px]`, `p-[13px]`), and one-off `px` values in inline styles.
- Note the component library in use (shadcn/ui, MUI, Chakra, custom) — fixes should follow its idioms, not fight them.

## Step 2 — Consistency checks

Look across pages/components (not just one file) for:
- **Color drift**: multiple near-identical hex values used for what should be one semantic color (e.g., three different grays for "muted text").
- **Spacing drift**: values that don't fall on the project's spacing scale (e.g., Tailwind's 4px steps) or mix rem/px inconsistently.
- **Typography drift**: ad-hoc font sizes/weights outside the declared type scale; inconsistent heading hierarchy across similar pages.
- **Component duplication**: near-identical buttons/cards/inputs reimplemented slightly differently instead of reusing one component.
- **Radius/shadow/border inconsistency**: e.g., `rounded-md` in one card and `rounded-xl` in another with no reason.

For each finding, cite the actual file and line, not a hypothetical.

## Step 3 — Accessibility checks (WCAG 2.2 AA baseline)

Go component by component:
- **Contrast**: text vs. background ≥ 4.5:1 (normal text) or ≥ 3:1 (large text ≥18px/bold ≥14px, and UI component borders/icons). Flag any token combination that fails this — most "looks fine to me" text-on-brand-color buttons fail here.
- **Semantic HTML**: `<div onClick>` that should be a `<button>`; `<span>` styled as a heading instead of `<h2>`/`<h3>`; missing `<label htmlFor>` on form inputs.
- **Icon-only controls**: need `aria-label` (icon buttons, close "X", hamburger menu).
- **Images**: missing or non-descriptive `alt` text; decorative images should have `alt=""`.
- **Keyboard**: every interactive element reachable by Tab, with a *visible* focus state (never `outline: none` without a replacement).
- **Motion**: check for a `prefers-reduced-motion` fallback on any non-trivial animation/transition.
- **Heading order**: no skipped levels (h1 → h3 with no h2) within a page.
- **Touch targets**: interactive elements comfortably ≥ 24–44px on mobile breakpoints.

## Step 4 — Report before you touch code

Present findings grouped by category (Consistency / Accessibility), each with:
1. What's wrong and where (file:line)
2. Why it matters (one sentence — contrast ratio, WCAG criterion, or "3 different grays doing the same job")
3. The proposed fix, expressed in terms of the project's *existing* tokens/components

Let the user confirm scope (e.g., "fix everything" vs. "just the accessibility items") before making sweeping changes across many files.

## Step 5 — Fix precisely

- Prefer editing the token source (Tailwind config, CSS variables) over patching every usage site, so the fix propagates.
- Where a component is duplicated, consolidate to one and update call sites — don't leave both versions.
- Keep diffs minimal and reviewable; this is a refinement pass, not a rewrite. Avoid touching unrelated code, formatting, or logic.
- After fixing, spot-check contrast/focus visually if the environment supports screenshots.

## Quick reference: useful searches

```bash
# Raw hex colors outside the token file
grep -rn "#[0-9a-fA-F]\{3,6\}" --include="*.tsx" --include="*.jsx" --include="*.css" src/ | grep -v "tailwind.config\|globals.css"

# Arbitrary Tailwind values (possible drift from the scale)
grep -rnE "\[(text|p|m|gap|rounded)-\[" --include="*.tsx" src/

# Clickable divs that should probably be buttons
grep -rn "<div[^>]*onClick" --include="*.tsx" --include="*.jsx" src/

# Images without alt
grep -rn "<img\b" --include="*.tsx" --include="*.jsx" src/ | grep -v "alt="

# Outline removed without a visible replacement
grep -rn "outline-none\|outline: none" --include="*.tsx" --include="*.css" src/
```

These are starting points to scope the audit fast — always confirm findings by reading the actual surrounding code, not just the grep hit.