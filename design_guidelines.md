# Tower Rescue - Design Guidelines

## Brand Identity

**Purpose**: A casual, addictive idle-clicker game where players save a character by methodically destroying tower blocks through progressive clicking.

**Aesthetic Direction**: Playful/Toy-Like - Vibrant colors, bouncy animations, delightful micro-interactions. Think isometric mobile games like Monument Valley meets Cookie Clicker's satisfying progression. The memorable element is the CHARACTER'S PERSONALITY - animated reactions that make players feel connected and motivated.

**Differentiation**: Character-driven emotional engagement. Unlike sterile clicker games, this character REACTS to your progress (cheers, dances, encourages) creating an emotional bond that drives retention.

## Navigation Architecture

**Root Navigation**: Stack-Only (single-screen game with modal overlays)

**Screens**:
1. **Splash Screen** - App launch, shows game logo
2. **Main Menu** - Play, Settings, Stats
3. **Game Screen** - Core gameplay (primary screen)
4. **Pause Modal** - Resume, Restart, Main Menu
5. **Victory Modal** - Celebration when tower cleared
6. **Settings Modal** - Sound, Haptics, Reset Progress
7. **Stats Modal** - All-time records, achievements

## Color Palette

**Primary**: #FF6B35 (Vibrant Orange) - Energy, warmth, action
**Secondary**: #F7931E (Golden Yellow) - Rewards, bonuses
**Accent**: #00D9C0 (Turquoise) - Magical, uplifting
**Background**: #FFF4E6 (Warm Cream) - Soft, non-fatiguing
**Tower Blocks**: Gradient per level (#9B59B6 → #3498DB → #2ECC71 → #F39C12 → #E74C3C)
**Text Dark**: #2C3E50
**Text Light**: #FFFFFF
**Surface**: #FFFFFF with subtle shadow

## Typography

**Font**: Nunito (Google Font) - Rounded, friendly, highly legible
**Scale**:
- Display: 48px Bold (Victory screen)
- Title: 28px Bold (Screen headers)
- Stat Numbers: 24px Bold (Click counter, timer)
- Body: 16px Regular (Instructions, settings)
- Caption: 12px Regular (Small labels)

## Screen Specifications

### Main Menu
**Layout**: Full-screen centered content, no header
**Components**:
- Large game logo (top third)
- "PLAY" button (center, 280px wide, rounded-full, Primary color with subtle shadow)
- Row of icon buttons below: Stats, Settings (48px circles, Surface color)
- Character illustration peeking from bottom corner
**Insets**: Top: insets.top + 60px, Bottom: insets.bottom + 40px

### Game Screen
**Layout**: Full-screen isometric game view, floating UI elements
**Components**:
- Isometric tower (center, 3×3 grid of blocks)
- Character on top (animated sprite)
- Stats panel (top-left, translucent card):
  - Timer icon + time elapsed
  - Hammer icon + blocks destroyed
  - Target icon + clicks remaining on current block
- Pause button (top-right, 40px circle, translucent)
- Speech bubble (above character, appears periodically with encouraging text)
- Bonus popup (center-screen when triggered, animated entrance)
- Click counter (center-bottom, large number showing taps on current block)
**Insets**: All floating elements 20px from edges + safe area
**Interactions**:
- Tap anywhere on screen to register clicks
- Visual feedback: Block pulses on tap, cracks appear as progress increases
- Haptic feedback on each tap
- Celebration animation when block destroyed

### Pause Modal
**Layout**: Center modal, 320px wide, rounded corners (24px)
**Components**:
- Title "Paused"
- Resume button (Primary color)
- Restart button (Secondary color)
- Main Menu button (text-only, gray)
**Background**: Dimmed game screen (0.5 opacity black overlay)

### Victory Modal
**Layout**: Full-screen celebration overlay
**Components**:
- Victory illustration (large, center)
- "TOWER CLEARED!" text
- Stats summary (time, total clicks, blocks destroyed)
- "Play Again" button
- "Main Menu" button
**Background**: Confetti animation, white background

### Settings Modal
**Layout**: Full-screen sheet from bottom
**Components**:
- Header with "Settings" title and close button
- Toggle switches:
  - Sound Effects
  - Music
  - Haptic Feedback
- "Reset All Progress" button (destructive, red, at bottom with confirmation alert)
**Insets**: Top: headerHeight + 20px, Bottom: insets.bottom + 20px

### Stats Modal
**Layout**: Full-screen sheet
**Components**:
- Header with "Your Stats"
- Stat cards (white Surface):
  - Towers Completed
  - Total Blocks Destroyed
  - Fastest Time
  - Total Clicks
- Achievement badges (grid, 3 columns, grayscale if locked)

## Visual Design

**Block Design**: Isometric cubes with gradient fills, subtle outlines, numbered badge on front face showing click requirement
**Character**: Expressive, animated sprite (idle, cheer, worry states) in traditional Indian attire (kurta, turban)
**Animations**:
- Blocks: Shake on tap, crack texture overlay, explode particles on destroy
- Character: Bounce on block destroy, waving periodically, victory dance
- UI: Smooth transitions, spring-based animations for modals
**Icons**: Feather icons from @expo/vector-icons (Play, Pause, Settings, BarChart, etc.)
**Touchables**: Scale down to 0.95 on press, spring back on release

## Assets to Generate

**icon.png** - Game logo: Character on tower block, isometric view
**splash-icon.png** - Same as icon, used during launch

**character-idle.png** - Character standing, neutral expression, waving
**character-cheer.png** - Character celebrating, arms up
**character-worry.png** - Character looking concerned, hands on face

**victory-illustration.png** - Character escaping tower, triumphant pose with fireworks
**empty-tower.png** - Illustration for main menu showing cleared tower foundation

**block-texture.png** - Isometric block template (3 visible faces)
**crack-overlay.png** - Crack texture applied to blocks as damage increases

**bonus-hammer.png** - Power-up icon: upgraded hammer
**bonus-lightning.png** - Power-up icon: auto-destroy next block
**bonus-time.png** - Power-up icon: time bonus

All illustrations: Vibrant colors matching palette, soft shadows, isometric perspective, cartoon style with thick outlines