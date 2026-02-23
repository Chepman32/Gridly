SDD — Gridly (Offline Instagram Grid Tile Cutter for iOS)

Product one-liner: Gridly splits a single photo into perfectly aligned square tiles designed to reconstruct as a seamless mosaic in an Instagram profile grid—fully offline, with precision cropping, posting-order guidance, and export automation.

⸻

1) Product Definition

1.1 Target users
	1.	Creators & micro-influencers who maintain a curated profile aesthetic (brand consistency, mosaic posts).
	2.	Small businesses that use the profile grid as a storefront banner (promos, launches).
	3.	Casual users who want “cool grid posts” without Photoshop.

1.2 User goals
	•	Split a photo into a 3×N (or 3×3 / 3×4 / 3×5) set of square tiles.
	•	Ensure pixel-perfect alignment between tiles.
	•	Understand posting order to get the intended final layout.
	•	Export tiles reliably to Photos, ready for upload.
	•	Work fully offline, including repeat exports, history, favorites.

1.3 Pain points
	•	Misalignment due to cropping math errors and Instagram’s presentation quirks.
	•	Confusing posting order and grid orientation.
	•	Quality loss from repeated compression/resizing.
	•	Slow, clunky editors with complicated steps.
	•	Apps that require login or internet, or push “templates” that don’t fit.

1.4 Offline-first constraints (non-negotiable)
	•	All core functionality works without network:
	•	import → crop → tile → export → guidance
	•	local projects library with thumbnails
	•	Any remote graphic sources are used as design references and optional in-app inspiration gallery that is pre-cached on first run when online (never blocking core).
	•	No accounts, no servers.

⸻

2) Brand & Naming

2.1 App name

Gridly — short, memorable, neutral, not complex, no “flow/forge”.

2.2 Tone
	•	Professional, calm, precise.
	•	Avoid playful gimmicks; feels like a polished Apple-like utility.

2.3 Icon direction (no emoji)
	•	Abstract grid + crop frame motif.
	•	Use vector geometry only.
	•	Suggested references for moodboards (design only):
	•	Pexels (grid / mosaic / camera): https://www.pexels.com/search/mosaic/
	•	Pixabay (grid / abstract tiles): https://pixabay.com/images/search/mosaic/
	•	SVG icons (app internal): SF Symbols-like via react-native-vector-icons (or lucide-react-native), no emojis.

⸻

3) Information Architecture

3.1 Primary navigation pattern (iOS)

Tab Bar (4 tabs):
	1.	Projects (library)
	2.	Create (import + editor entry point)
	3.	Export (recent exports + batches)
	4.	Learn (posting guide, FAQs, safe export tips)

Rationale: frequent return to Projects; Create is central; Export provides quick recovery; Learn reduces confusion.

3.2 Global gestures and platform rules
	•	Back: edge-swipe (iOS interactive pop), always available where hierarchical navigation exists.
	•	Dismiss modals: pull-down to dismiss, with velocity-based spring.
	•	Editor:
	•	Pinch to zoom, pan to position image under grid mask.
	•	Two-finger rotate (optional toggle; default off to keep precision).
	•	Double-tap to zoom to fit/fill.
	•	Long-press on tile preview to “inspect seam” (magnified loupe).
	•	Bottom sheets for presets/settings; interactive drag.

3.3 Data model (offline)
	•	Project: original image reference, crop transform, grid preset, tile size, export history.
	•	ExportBatch: list of tile file paths in Photos (plus local temp), timestamps, preset, and posting order mapping.
	•	Store locally using SQLite (WatermelonDB/SQLite) or MMKV + file system for assets.

⸻

4) Core Screens (8) — Detailed UI/UX

Each screen includes: layout, components, interactions, wireframe, states, accessibility, and micro-interactions.

⸻

Screen 1 — Splash + Launch Experience (Skia + Reanimated)

Purpose
Instant “premium utility” impression; communicate brand precision without wasting user time.

Visual concept
A clean dark canvas, the Gridly mark appears as a 3×3 grid of rounded squares. Then a physics-based “deconstruction and reassembly” animation suggests tiling.

Animation choreography (must feel iOS-native)
	•	Phase A: Emergence
	•	Background: subtle radial gradient (dark mode: near-black to charcoal; light mode: off-white to cool gray).
	•	Grid icon drawn with Skia paths; tiles fade in with slight scale-up.
	•	Phase B: Physics breakdown
	•	Each tile becomes a particle body:
	•	Reanimated shared values for position/velocity.
	•	Tiles “explode” outward with spring impulses, slight rotation.
	•	Motion blur simulated via Skia trailing strokes (short-lived).
	•	Phase C: Magnetic regroup
	•	Tiles return with “magnet” force into perfect alignment.
	•	Final snap uses critically damped spring.
	•	Phase D: Wordmark twist
	•	“GRIDLY” vector text (no emoji) rapidly twists (Skia text path warp) then settles.
	•	End state fades seamlessly into Projects or Create, depending on last session.

Accessibility
	•	Respect Reduce Motion:
	•	Replace physics with quick crossfade + subtle opacity transitions.
	•	Respect Increase Contrast:
	•	stronger tile outlines, clearer wordmark.

⸻

Screen 2 — Projects (Library Home)

Goal
Fast access to recent work; confidence that everything is stored offline.

Layout
	•	Top: Large navigation title “Projects”
	•	Right: “Select”
	•	Left: Settings icon (gear)
	•	Content:
	•	Primary section: “Recent” horizontal carousel (last 6)
	•	Grid section: all projects as cards (2 columns on iPhone portrait)
	•	Bottom: floating “New Project” pill button (Create shortcut)

Components
	•	Project Card:
	•	Thumbnail (local, generated on save)
	•	Badge: preset (e.g., “3×4”)
	•	Secondary: last export date, tile resolution (e.g., 1080)
	•	Quick actions (swipe on card):
	•	Swipe left: Delete (destructive), Duplicate, Export
	•	Swipe right: Favorite toggle

Wireframe (portrait)

[ Projects                     (Select) ]
[ (gear) ]
------------------------------------------------
[ Recent ]
[ (card)(card)(card) -> horizontal scroll       ]
------------------------------------------------
[ All Projects ]
[ (card)    (card) ]
[ (card)    (card) ]
[ (card)    (card) ]
------------------------------------------------
                 [  + New Project  ]  (pill)

Interactions & animations
	•	Opening a project: card expands into editor with matched-geometry feel:
	•	Thumbnail morphs into editor canvas via Reanimated shared transitions.
	•	Pull-to-refresh:
	•	purely local (re-index thumbnails). Use subtle haptic + spring.
	•	Selection mode:
	•	cards wiggle slightly (very subtle), show checkmarks.
	•	bottom action bar slides up: Export / Delete / Share batch.

States
	•	Empty:
	•	Minimal illustration (vector icon) + CTA “Create your first grid”
	•	Provide a “How it works” inline link.
	•	Error (corrupted local file):
	•	Card shows warning badge; tap gives recovery sheet:
	•	“Relink image” (Files/Photos)
	•	“Remove project”
	•	Loading (initial index):
	•	Skeleton cards with shimmer (Skia gradient mask) but restrained.

Accessibility
	•	Cards are single focusable elements with labeled metadata:
	•	“Project, 3 by 4 grid, last exported Feb 23, tile size 1080.”
	•	Dynamic Type:
	•	Titles scale, metadata truncates with 2 lines max.

⸻

Screen 3 — Create (Import Hub)

Purpose
Single, obvious entry point to start a new split.

Layout
	•	Large title: “Create”
	•	Two main cards:
	1.	Import from Photos
	2.	Import from Files
	•	Optional “Try Sample” (offline bundled sample images)
	•	Bottom: “Preset picker” preview row (3×3, 3×4, 3×5, 3×6, 4×4)

Wireframe

[ Create ]
------------------------------------------------
[  Import from Photos   > ]   (large card)
[  Import from Files    > ]   (large card)
------------------------------------------------
[ Presets:  3×3  3×4  3×5  3×6  4×4  ... ]
------------------------------------------------
[ Try Sample (offline) ]

Interactions
	•	Choosing preset here becomes the default for the Editor.
	•	Cards animate on tap:
	•	press-in scale to 0.98, shadow changes, spring back.

States
	•	Permission denied (Photos):
	•	Show inline card explaining “Limited Access” + CTA to manage access.
	•	No Photos:
	•	Suggest Files import and samples.

Accessibility
	•	Buttons use standard iOS semantics; supports VoiceOver actions:
	•	“Activate” imports; “More actions” for preset selection.

⸻

Screen 4 — Editor (Crop + Grid Overlay)

This is the flagship screen.
Primary task
Position the photo within a grid frame so that exported tiles reconstruct seamlessly.

Layout overview
	•	Top bar (compact):
	•	Back
	•	Project name (tap to rename)
	•	Undo/Redo (when transforms exist)
	•	Main canvas:
	•	Image viewport with masked grid overlay.
	•	Optional seam preview mode.
	•	Bottom control stack (gesture-first, controls secondary):
	1.	Preset / Tiles count
	2.	Fit / Fill toggle
	3.	Rotation lock toggle (default locked)
	4.	Tile resolution selector (1080 / 2048 / Custom)
	5.	“Next” (to Preview & Export)

Grid overlay visuals (Skia)
	•	Thin lines, 1 px, dynamic contrast.
	•	Corner crop handles are decorative only (gestures do the work); but can be enabled for precision dragging.

Wireframe

[ < Back   Project Name ▼         Undo  Redo ]
------------------------------------------------
|                                              |
|            [ Image under mask ]              |
|      +--------------------------------+      |
|      |  |   |   |                    |      |
|      |--+---+---+--------------------|      |
|      |  |   |   |                    |      |
|      +--------------------------------+      |
|                                              |
------------------------------------------------
[ Preset: 3×4 ▼ ]  [ Fit | Fill ]  [ Lock Rot ]
[ Resolution: 1080 ▼ ]     [ Seam Inspect ▢ ]
[                 ( Next )                       ]

Gesture model (Facebook/Tinkoff-like fluidity)
	•	One-finger pan moves image.
	•	Pinch zoom with rubber-banding at min/max scales.
	•	Double-tap toggles between:
	•	“Fit entire frame” and “Fill frame” zoom levels.
	•	Two-finger rotation (optional):
	•	Disabled by default; user can enable in bottom row.
	•	When enabled, rotation snaps to 0° with magnet threshold.

Precision features
	•	Snap guides:
	•	When image edges align with grid frame edges, show subtle snap line and haptic tick.
	•	Seam Inspect mode:
	•	Overlay shows thickened grid lines and a “gap detector” preview: a magnified strip along each seam.
	•	Long-press on a seam opens a magnifier loupe (Skia) showing pixel-level continuity.

Editor animations
	•	Grid overlay fades in/out on movement:
	•	When user drags/zooms, overlay becomes slightly stronger (clarity).
	•	When idle, overlay thins to reduce visual noise.
	•	Bottom controls collapse when user is actively manipulating image (to avoid occlusion):
	•	drag begins → controls slide down 20–40 px and reduce opacity → on end, spring back.

States
	•	Loading image:
	•	Show blurred thumbnail placeholder + skeleton controls.
	•	Decode too large:
	•	Prompt: “Optimize for editing” (local downscale for preview only; export uses original).
	•	Error reading:
	•	Offer re-import or restore from Files.

Accessibility
	•	Provide non-gesture alternatives:
	•	“Adjust” sheet with sliders for X/Y offset, zoom, rotation (if enabled).
	•	VoiceOver rotor actions:
	•	“Zoom In”, “Zoom Out”, “Center”, “Reset”.
	•	Dynamic Type:
	•	Controls become icon-only with accessible labels at large sizes.

⸻

Screen 5 — Preview (Tiles + Posting Order)

Purpose
Show exactly what will be exported and how to post to achieve intended final grid.

Layout
	•	Top: “Preview”
	•	Segment control:
	•	Tiles
	•	Posting Order
	•	Profile Simulation
	•	Tiles view: grid of numbered tiles (numbers are vector overlay, not emoji).
	•	Posting Order view: reorder path animation (arrows) + step list.
	•	Profile Simulation: mock Instagram grid (no trademarked UI; a neutral grid sim).

Wireframe

[ Preview                          (Export) ]
[  Tiles | Posting Order | Simulation ]
------------------------------------------------
[ 1 ][ 2 ][ 3 ]
[ 4 ][ 5 ][ 6 ]
[ 7 ][ 8 ][ 9 ]   ... (scroll if 3×N)
------------------------------------------------
[ Toggle: Number Overlays ▢ ]
[ Toggle: Show Seam Lines ▢ ]

Posting order logic (explained in-app)
	•	Provide a “Recommended posting sequence” that matches the chosen goal:
	•	“Build final mosaic from bottom row to top row” sequence.
	•	The app visually animates the sequence:
	•	A glowing outline moves tile-to-tile with spring.
	•	Each tile flips briefly (Skia) when it becomes “next”.

Micro-interactions
	•	Tap a tile:
	•	Fullscreen tile inspector with pinch zoom and metadata (tile index, dimensions).
	•	Long-press tile:
	•	“Mark as posted” (local checklist)
	•	“Share tile” (iOS share sheet)

States
	•	If user selected “No numbers”:
	•	Ensure alternative: tile index shown in inspector and posting list.
	•	If very tall grids:
	•	Provide “Row jump” mini index on right edge.

Accessibility
	•	Tiles are focusable; VoiceOver reads:
	•	“Tile 7 of 12, row 3 column 1.”
	•	Posting order list is also accessible as a simple ordered table:
	•	“Step 1: Post tile 12…”

⸻

Screen 6 — Export (Batch Export & Save to Photos)

Purpose
Reliable offline export with clear progress, zero ambiguity.

Layout
	•	Top: “Export”
	•	Summary card:
	•	Preset, tile size, count, estimated storage
	•	Primary action: “Save All to Photos”
	•	Secondary:
	•	“Share as ZIP” (offline via local file creation)
	•	“Share Individually”
	•	Progress area: timeline-like indicator (not emoji)
	•	After export: confirmation + “Open Photos” deep link

Wireframe

[ Export ]
------------------------------------------------
[ Summary: 3×4 · 12 tiles · 1080px · ~XX MB ]
------------------------------------------------
[  Save All to Photos  ]  (primary)
[  Share as ZIP        ]  (secondary)
[  Share Individually  ]  (secondary)
------------------------------------------------
[ Progress ]
[ ◉ Preparing ]
[ ○ Rendering tiles ]
[ ○ Writing to Photos ]
[ ○ Done ]
------------------------------------------------
[ Recent Exports (list) ]

Export pipeline (implementation-friendly)
	•	Render tiles from original using native module or performant library.
	•	Generate deterministic filenames:
	•	Gridly_ProjectName_3x4_Tile_01.jpg
	•	Keep a local copy for re-share without re-render (optional, user setting).

Fancy iOS motion
	•	Progress transitions:
	•	Each step snaps in with spring and subtle haptic.
	•	During rendering:
	•	Skia live preview: a small strip showing currently processed tile, shimmering overlay.

States
	•	Photo permission limited:
	•	Provide “Save to Files instead” fallback.
	•	Disk space low:
	•	Show “Not enough space” sheet with suggestions (reduce resolution, export fewer).
	•	Export error:
	•	Provide retry and diagnostic “Copy details” (plain text, no emoji).

Accessibility
	•	Announce progress via VoiceOver:
	•	“Rendering tile 3 of 12.”
	•	Large text mode:
	•	Steps become stacked cards.

⸻

Screen 7 — Project Details (Rename, Settings, History)

Purpose
Control center for a project without cluttering the editor.

Layout
	•	Header: large thumbnail + project name + favorite star.
	•	Sections:
	•	Grid preset
	•	Resolution default
	•	Number overlay preference
	•	Rotation toggle default
	•	Export history (tap to open batch)
	•	Actions: Duplicate, Delete, Reset crop

Wireframe

[ Project Details ]
[  (thumbnail)  Project Name   (★) ]
------------------------------------------------
[ Preset: 3×4 > ]
[ Resolution: 1080 > ]
[ Number overlays: On > ]
[ Rotation: Locked > ]
------------------------------------------------
[ Export History ]
[ Feb 23  · 12 tiles · Saved to Photos > ]
[ Feb 21  · 12 tiles · ZIP shared > ]
------------------------------------------------
[ Duplicate ]  [ Reset Crop ]  [ Delete ]

Interactions
	•	Changing preset prompts:
	•	“Keep current crop” vs “Reframe to new aspect”.
	•	Reset crop uses a satisfying spring “snap back” animation in editor.

States
	•	No export history: show educational hint “Export creates a batch you can revisit”.

Accessibility
	•	Clear destructive action separation; VoiceOver warns before delete.

⸻

Screen 8 — Learn (Posting Guide + FAQ + Tips)

Purpose
Eliminate the biggest confusion: posting order and expected final appearance.

Layout
	•	Search bar (local search)
	•	Cards:
	1.	“How posting order works”
	2.	“Common mistakes (alignment, compression)”
	3.	“Best resolutions”
	4.	“Profile simulation”
	•	Interactive tutorial:
	•	A mock grid where user drags numbered tiles to see order effects.

Wireframe

[ Learn ]
[ Search: "posting order" ]
------------------------------------------------
[ How posting order works      > ]
[ Avoid alignment mistakes     > ]
[ Recommended export sizes     > ]
[ Profile simulation tips      > ]
------------------------------------------------
[ Interactive demo (mini grid) ]

Animations
	•	Interactive demo uses Skia to animate tile insertion at top-left (simulating new post).
	•	Motion is springy, with slight bounce.

Accessibility
	•	Tutorial has a “Text-only explanation” toggle.
	•	All diagrams have VoiceOver descriptions.

⸻

5) Visual Design System (Apple Principal Designer Level)

5.1 Foundations

Color system (Light/Dark + semantic)
Principles
	•	High contrast by default.
	•	Subtle surfaces, crisp separators.
	•	Color is functional (status, CTA), not decorative noise.

Core palette
	•	Primary: Indigo/Blue family (calm, precise)
	•	Accent: Cyan (for highlights and focus rings)
	•	Destructive: system red
	•	Success: system green
	•	Warning: system orange

Surfaces
	•	bg/primary: light = #F7F8FA, dark = #0B0C0F
	•	bg/secondary: light = #FFFFFF, dark = #14151A
	•	surface/elevated: light = #FFFFFF, dark = #1C1D24
	•	separator: light = rgba(0,0,0,0.08), dark = rgba(255,255,255,0.10)

Text
	•	text/primary: light = #0B0C0F, dark = #F5F6FA
	•	text/secondary: light = rgba(11,12,15,0.66), dark = rgba(245,246,250,0.68)
	•	text/tertiary: light = rgba(11,12,15,0.45), dark = rgba(245,246,250,0.46)

Semantic
	•	semantic/success: #2ECC71 (mapped to system green feel)
	•	semantic/warning: #F39C12
	•	semantic/error: #FF3B30 (iOS-like)

Contrast guidance
	•	Ensure text on any surface meets WCAG AA; critical labels aim for AAA.
	•	In dark mode, avoid pure black backgrounds for comfort.

Typography (9 levels, responsive, accessibility)
Use SF Pro via iOS system fonts (React Native default), no custom fonts required.
	1.	Display — 34/40, Semibold
	2.	Title1 — 28/34, Semibold
	3.	Title2 — 22/28, Semibold
	4.	Title3 — 20/26, Semibold
	5.	Headline — 17/22, Semibold
	6.	Body — 17/22, Regular
	7.	Callout — 16/21, Regular
	8.	Subhead — 15/20, Regular
	9.	Footnote — 13/18, Regular

	•	Caption2 optional for metadata — 12/16

Responsive scale
	•	Support Dynamic Type categories; line height scales proportionally.
	•	At very large sizes:
	•	collapse toolbars, use icon buttons with accessible labels
	•	switch to two-line titles, avoid truncation for critical info.

Grid system
	•	12-column grid, 16 pt margins on iPhone.
	•	Gutter: 12 pt.
	•	Cards typically span 6 columns each in 2-up layout.
	•	Editor canvas uses full-width minus safe margins.

Spacing (8pt baseline)
	•	space/1 = 8
	•	space/2 = 16
	•	space/3 = 24
	•	space/4 = 32
	•	space/5 = 40
Use 4pt only for micro adjustments (e.g., icon-to-label).

Corner radius
	•	Small: 10 (chips)
	•	Medium: 14 (cards)
	•	Large: 18 (modals/sheets)
	•	Editor canvas corners: 16 (soft but precise)

Shadow/elevation
	•	Use iOS-like subtle shadows; in dark mode rely more on borders than shadows.

⸻

5.2 Components Library (30+ components)

Below is a production-oriented component set with anatomy, states, accessibility, and code specs hints (React Native).
	1.	Primary Button

	•	States: default/pressed/disabled/loading
	•	Anatomy: label + optional leading icon
	•	A11y: role=button, label describes action
	•	Motion: press-in scale 0.98 + spring back

	2.	Secondary Button

	•	Outlined, subtle fill on pressed
	•	Use for non-destructive alternatives

	3.	Destructive Button

	•	Red label, light red fill on pressed
	•	Requires confirm sheet for irreversible actions

	4.	Icon Button

	•	44×44 min tap target
	•	Clear hit slop for small icons

	5.	Pill CTA (Floating)

	•	For “New Project”
	•	Sticky above tab bar with safe-area padding

	6.	Card

	•	Elevated surface, optional thumbnail
	•	States: default/selected/disabled
	•	A11y: grouped content with single focus

	7.	Project Card

	•	Specialized card: thumbnail, preset badge, metadata

	8.	Badge

	•	Preset tag “3×4”
	•	Colors: neutral; semantic optional

	9.	Segmented Control

	•	For Preview tabs
	•	Motion: indicator slides with spring

	10.	Bottom Sheet

	•	Drag handle, snap points (collapsed/expanded)
	•	Dismiss: pull-down with velocity

	11.	Modal Dialog

	•	For confirmations; use iOS alert style if appropriate

	12.	List Row

	•	Leading icon, title, value, chevron
	•	Supports large text and wraps

	13.	Swipe Actions

	•	iOS native feel; friction tuned to avoid accidental delete

	14.	Search Bar

	•	Local search on Learn
	•	States: active/empty/has text

	15.	Toast

	•	Non-blocking feedback “Saved”
	•	A11y: announce via VoiceOver

	16.	Inline Banner

	•	For permission notices, storage warnings

	17.	Progress Stepper

	•	Export pipeline steps
	•	Animated checkmarks (vector), no emoji

	18.	Skeleton Loader

	•	Subtle shimmer; reduce motion disables shimmer

	19.	Image Canvas

	•	Skia-backed view that displays image with transformations
	•	Provides overlay layers (grid lines, guides)

	20.	Grid Overlay

	•	Adjustable line weight; higher during interaction

	21.	Magnifier Loupe

	•	Skia lens showing pixels along seam on long-press

	22.	Preset Picker

	•	Horizontal chips, selected state, haptics

	23.	Resolution Picker

	•	Inline selector + advanced custom entry

	24.	Toggle Row

	•	Label + switch, used in Project Details

	25.	Stepper

	•	Increment/decrement numeric value (for custom rows/columns)

	26.	Numeric Input Sheet

	•	For custom N (rows), validation, large keypad

	27.	Empty State View

	•	Icon + title + description + CTA

	28.	Error State View

	•	Icon + explanation + recovery actions

	29.	Tile Grid

	•	Efficient FlatList grid with stable keys

	30.	Tile Inspector

	•	Fullscreen modal with zoomable tile

	31.	Checklist

	•	Posting order “Mark posted”
	•	A11y: supports “checked” state

	32.	Tooltip

	•	Short explanations (e.g., “Fit vs Fill”)
	•	Auto-dismiss; reduce motion friendly

	33.	Haptic Controller

	•	Centralized mapping of subtle haptics (selection, success, warning)

	34.	Divider

	•	Hairline separators with dark mode adaptation

	35.	Navigation Header

	•	Large title + collapsing behavior when scrolling

⸻

5.3 Patterns & Principles

Design principles
	1.	Precision over decoration
	2.	Gesture-first, controls second
	3.	One task per screen, minimal branching
	4.	Clear recovery paths (undo, re-import, re-export)
	5.	Offline confidence (no spinners waiting for internet)

Do
	•	Use clear labels: “Save All to Photos”, “Posting Order”
	•	Prefer bottom sheets for settings
	•	Provide explicit export quality choices

Don’t
	•	Don’t hide critical actions behind long menus
	•	Don’t use emoji anywhere
	•	Don’t show fake “Instagram UI” clones; use neutral simulation

⸻

5.4 Design tokens (JSON, publish-ready)

{
  "color": {
    "bg": {
      "primary": { "light": "#F7F8FA", "dark": "#0B0C0F" },
      "secondary": { "light": "#FFFFFF", "dark": "#14151A" }
    },
    "surface": {
      "elevated": { "light": "#FFFFFF", "dark": "#1C1D24" }
    },
    "text": {
      "primary": { "light": "#0B0C0F", "dark": "#F5F6FA" },
      "secondary": { "light": "rgba(11,12,15,0.66)", "dark": "rgba(245,246,250,0.68)" },
      "tertiary": { "light": "rgba(11,12,15,0.45)", "dark": "rgba(245,246,250,0.46)" }
    },
    "separator": {
      "default": { "light": "rgba(0,0,0,0.08)", "dark": "rgba(255,255,255,0.10)" }
    },
    "brand": {
      "primary": "#3B5BFF",
      "accent": "#1BC9FF"
    },
    "semantic": {
      "success": "#2ECC71",
      "warning": "#F39C12",
      "error": "#FF3B30"
    }
  },
  "typography": {
    "display": { "size": 34, "lineHeight": 40, "weight": "600" },
    "title1": { "size": 28, "lineHeight": 34, "weight": "600" },
    "title2": { "size": 22, "lineHeight": 28, "weight": "600" },
    "title3": { "size": 20, "lineHeight": 26, "weight": "600" },
    "headline": { "size": 17, "lineHeight": 22, "weight": "600" },
    "body": { "size": 17, "lineHeight": 22, "weight": "400" },
    "callout": { "size": 16, "lineHeight": 21, "weight": "400" },
    "subhead": { "size": 15, "lineHeight": 20, "weight": "400" },
    "footnote": { "size": 13, "lineHeight": 18, "weight": "400" },
    "caption2": { "size": 12, "lineHeight": 16, "weight": "400" }
  },
  "layout": {
    "gridColumns": 12,
    "margin": 16,
    "gutter": 12,
    "radius": { "s": 10, "m": 14, "l": 18, "canvas": 16 },
    "spacing": { "1": 8, "2": 16, "3": 24, "4": 32, "5": 40 },
    "tapTargetMin": 44
  },
  "motion": {
    "spring": {
      "standard": { "damping": 18, "stiffness": 220, "mass": 1.0 },
      "snappy": { "damping": 16, "stiffness": 320, "mass": 0.9 },
      "gentle": { "damping": 22, "stiffness": 180, "mass": 1.1 }
    },
    "timing": { "fast": 160, "normal": 220, "slow": 320 }
  }
}


⸻

6) Motion & Micro-interaction Specs (Reanimated + Skia)

6.1 Motion rules
	•	All transitions use spring by default.
	•	Timing-based animations only for fades and subtle opacity.
	•	Respect iOS settings:
	•	Reduce Motion: remove large transforms, keep fades.
	•	Reduce Transparency: increase opacity of overlays.

6.2 Key animations to implement
	1.	Shared element transition Projects → Editor:
	•	Thumbnail expands into canvas.
	2.	Editor control dock hide/show:
	•	Active gesture → controls slide down and reduce opacity.
	3.	Grid overlay adaptive clarity:
	•	Interaction increases line alpha and thickness slightly.
	4.	Seam loupe:
	•	Long-press → loupe scales from 0.85 to 1.0 with spring, follows finger with slight lag.
	5.	Posting order path:
	•	Animated outline and arrows, stepping with haptic ticks.
	6.	Export pipeline step completion:
	•	Vector checkmark draw (Skia path) with spring reveal.

6.3 Haptics (subtle)
	•	Selection changed: preset chips.
	•	Snap guide alignment in editor.
	•	Export step completion.
	•	Destructive confirm: heavier impact.

⸻

7) Accessibility & Compliance

7.1 WCAG + iOS expectations
	•	Contrast meets WCAG AA for all text; critical instructions aim AAA.
	•	Minimum touch target 44×44 pt.
	•	Dynamic Type supported across all screens:
	•	Layout reflows; avoid clipped text.
	•	VoiceOver:
	•	Tiles provide row/column context.
	•	Editor provides alternative adjustments via sliders.

7.2 Screen reader structure
	•	Use semantic grouping: headings (Projects, Recent).
	•	Ensure modal focus trapping and correct dismiss actions.

7.3 Reduce Motion support
	•	Disable splash physics and path animations; use crossfade + subtle scale.
	•	Disable shimmer; show static skeleton.

⸻

8) Error / Empty / Loading State Catalog

8.1 Import
	•	Photos permission denied → inline explanation + “Manage Access”
	•	Corrupt file → recovery sheet
	•	Unsupported format → show supported types and prompt Files alternative

8.2 Editor
	•	Memory warning → automatically switch to optimized preview resolution
	•	Invalid crop state → “Reset” with undo option

8.3 Export
	•	Photos write failure → offer Files export
	•	Low storage → provide resolution downgrade sheet
	•	Batch partially saved → show which tiles failed + retry failed only

⸻

9) Developer Guide (Implementable in RN + JS Tools)

9.1 Recommended stack (iOS-first)
	•	Navigation: @react-navigation/native (native stack for iOS gestures)
	•	Gestures: react-native-gesture-handler
	•	Motion: react-native-reanimated
	•	Canvas/overlays: @shopify/react-native-skia
	•	Storage:
	•	Projects metadata: SQLite or WatermelonDB
	•	Thumbnails/tiles: filesystem (DocumentDirectory)
	•	Image processing:
	•	Best: native module with Core Image / vImage for cropping into tiles
	•	Preview: Skia rendering with transform matrix

9.2 Performance guidance
	•	Never re-decode full-resolution image repeatedly in JS.
	•	Use:
	•	low-res proxy for editing preview
	•	original asset for export only
	•	FlatList virtualization for tile grids and project lists.
	•	Cache thumbnails aggressively.

9.3 Visual parity guidance
	•	Use platform blur sparingly; keep legible in dark mode.
	•	Avoid heavy gradients; keep surfaces consistent.

⸻

10) Designer’s Notes (Rationale & Trade-offs)
	1.	Gesture-first editor reduces UI clutter and matches modern social apps: direct manipulation is faster than sliders.
	2.	Posting order is surfaced as a first-class view because it’s the highest confusion driver.
	3.	Offline-first means:
	•	sample assets are bundled
	•	Learn content is local
	•	any “inspiration” gallery is optional and cached
	4.	No emoji policy: all decorative elements are vector icons or Skia shapes; avoids inconsistent tone and ensures professional polish.
	5.	Precision features (snap guides, seam loupe) differentiate Gridly from simple “split image” apps.

⸻

Design Director Critique (Nielsen’s 10 Heuristics + Quality Review)

Scores: 1 (poor) → 5 (excellent)
	1.	Visibility of system status — 5/5
Export pipeline stepper + VoiceOver announcements make progress unambiguous.
	2.	Match between system and real world — 4/5
Concepts “tiles, grid, posting order” are concrete. Risk: users may not understand why order matters; mitigated by Learn + Simulation.
	3.	User control and freedom — 4/5
Undo/redo, reset crop, duplicate project, re-export. Minor gap: rotation advanced toggle might confuse; default locked is correct.
	4.	Consistency and standards — 5/5
Follows iOS patterns (large titles, sheets, swipe actions). Motion respects platform conventions.
	5.	Error prevention — 4/5
Snap guides, seam inspect, preset aspect warnings. Could add “Instagram-safe export” preset explanation (Important).
	6.	Recognition rather than recall — 5/5
Preview shows numbered tiles and animated order. Projects and export history reduce mental load.
	7.	Flexibility and efficiency — 4/5
Power users can duplicate projects and re-export quickly. Opportunity: add quick preset switch + automatic reframing suggestions.
	8.	Aesthetic and minimalist design — 4/5
Generally restrained. Potential risk: too many toggles in editor bottom dock; could collapse into a single “Tools” sheet (Polish).
	9.	Help users recognize, diagnose, recover — 5/5
Strong recovery sheets (re-import, files export fallback, retry failed tiles).
	10.	Help and documentation — 5/5
Learn tab plus interactive demo is robust and offline-friendly.

⸻

Visual hierarchy, typography, color
	•	Hierarchy: strong (large titles, clear CTAs). Editor may overload with controls; recommend progressive disclosure.
	•	Typography: correct use of iOS sizes; ensure large Dynamic Type doesn’t collapse key actions.
	•	Color: functional; confirm contrast in dark mode for thin grid lines—may need adaptive thickness.

⸻

Cognitive load & interaction clarity

Strengths
	•	Clear linear flow: Create → Edit → Preview → Export.
	•	Posting order guided visually.

Risks
	•	Users unfamiliar with mosaics might not understand the outcome quickly enough.
	•	Fix: show “final profile simulation” earlier (within editor as a mini preview chip).

⸻

Accessibility review
	•	Strong: VoiceOver labels for tiles, progress announcements, reduce motion behavior.
	•	Risk: seam loupe and thin lines.
	•	Fix: “High Contrast Grid” toggle that thickens lines and increases alpha automatically when Increase Contrast is enabled.

⸻

Differentiation

Distinctive features:
	•	Seam inspect + loupe (precision tool)
	•	Elegant Skia/Reanimated motion
	•	Offline-first, project history, export batches

⸻

Prioritized fixes

Critical
	1.	Editor control overload
	•	Consolidate secondary toggles into a Tools bottom sheet:
	•	Rotation, seam inspect, guides, resolution
	•	Keep only: Preset + Next visible by default.
	2.	Posting order confusion for first-time users
	•	Add a one-time, skippable micro-coach on Preview:
	•	“Instagram inserts new posts at top-left; this is why order matters.”

Important
	3.	Instagram-safe export clarity
	•	Add “Recommended” badge on 1080 tile size and explain why (quality + compatibility).
	4.	Large Dynamic Type layout
	•	Add responsive behavior:
	•	collapse labels into icons
	•	move less-critical content below fold

Polish
	5.	More delight without noise
	•	Add subtle, optional “tile shimmer” on Preview when toggling number overlays (respect Reduce Motion).

⸻

Two alternative redesign directions

Direction A — “Ultra-Utility Pro”

Goal: maximum speed, minimal visuals, like a pro camera utility.
	•	Home screen is Projects only; Create is a floating action.
	•	Editor uses a compact top bar, all tools in one bottom sheet.
	•	Preview merges into Export: “Save + show order” as one screen.
	•	Strong for power users; less educational.

Direction B — “Guided Storytelling”

Goal: first-time success, onboarding-led.
	•	A guided 3-step wizard: Import → Frame → Export + Order.
	•	Inline education appears as contextual tips (not a separate Learn tab).
	•	Stronger simulation earlier; “Your final grid will look like this” always visible.
	•	Best for mass audience; slightly slower for experts.

⸻

Final Deliverable Summary

Gridly is designed as an iOS-first, offline, gesture-native utility with premium motion, precision tiling, and clear posting guidance. The system is production-ready: eight core screens, a complete design system with tokens, 30+ components, rigorous states, and a critique with actionable improvements.