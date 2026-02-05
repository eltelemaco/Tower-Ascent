# Tower Rescue

A casual tap/clicker game built with **Expo (React Native)** and an **Express** backend. Free a character trapped in a tower by destroying blocks—each block requires a set number of taps. Play on **iOS**, **Android**, or **web**.

---

## Table of Contents

- [Folder Structure](#folder-structure)
- [Languages](#languages)
- [Technology Stack](#technology-stack)
- [Configuration Files](#configuration-files)
- [Scripts](#scripts)

---

## Folder Structure

```
Tower-Ascent/
├── assets/                    # Static media (images, sounds)
│   ├── images/                # Icons, splash, game art (PNG)
│   │   ├── icon.png
│   │   ├── splash-icon.png
│   │   ├── favicon.png
│   │   ├── character-*.png
│   │   ├── block-stone.png, tower-top.png, victory-illustration.png
│   │   └── android-icon-*.png
│   └── sounds/                # In-game audio (MP3)
│       ├── tap.mp3
│       ├── destroy.mp3
│       ├── bonus.mp3
│       └── victory.mp3
│
├── client/                    # Expo / React Native application
│   ├── index.js               # App entry (registers root component)
│   ├── App.tsx                # Root component, providers, navigation
│   ├── components/            # Reusable UI components
│   │   ├── Tower.tsx          # Tower blocks and game board
│   │   ├── Character.tsx      # Character with states (idle/cheer/worry)
│   │   ├── BonusModal.tsx     # Bonus offer (hammer, lightning, etc.)
│   │   ├── PauseModal.tsx     # Pause menu
│   │   ├── VictoryModal.tsx   # Victory screen
│   │   ├── StatsModal.tsx     # All-time stats
│   │   ├── SettingsModal.tsx  # Sound, haptics
│   │   ├── StatsPanel.tsx     # In-game stats (time, blocks)
│   │   ├── SpeechBubble.tsx   # Character messages
│   │   ├── Button.tsx, Card.tsx, Spacer.tsx
│   │   ├── ThemedText.tsx, ThemedView.tsx
│   │   ├── ErrorBoundary.tsx, ErrorFallback.tsx
│   │   ├── HeaderTitle.tsx
│   │   └── KeyboardAwareScrollViewCompat.tsx
│   ├── constants/
│   │   └── theme.ts           # Colors, spacing, typography, fonts
│   ├── context/
│   │   └── GameContext.tsx    # Game state, tap logic, bonuses, stats
│   ├── hooks/
│   │   ├── useColorScheme.ts
│   │   ├── useColorScheme.web.ts
│   │   ├── useScreenOptions.ts
│   │   └── useTheme.ts
│   ├── lib/
│   │   └── query-client.ts    # TanStack React Query client
│   ├── navigation/
│   │   ├── RootStackNavigator.tsx   # Main app stack (MainMenu, Game)
│   │   ├── MainTabNavigator.tsx
│   │   ├── MainTabNavigator26.tsx
│   │   ├── HomeStackNavigator.tsx
│   │   └── ProfileStackNavigator.tsx
│   └── screens/
│       ├── MainMenuScreen.tsx # Play, Stats, Settings
│       ├── GameScreen.tsx     # Core gameplay
│       ├── HomeScreen.tsx
│       ├── ProfileScreen.tsx
│       └── ModalScreen.tsx
│
├── server/                    # Express backend
│   ├── index.ts               # App setup, CORS, static/landing, error handler
│   ├── routes.ts              # API route registration (HTTP server)
│   ├── storage.ts             # In-memory storage (MemStorage) for users
│   └── templates/
│       └── landing-page.html  # HTML landing page template
│
├── shared/                    # Code shared by client and server
│   └── schema.ts              # Drizzle schema (users), Zod insert schema
│
├── scripts/
│   └── build.js               # Static Expo build (Metro, bundles, manifests)
│
├── .gitignore
├── .replit                    # Replit runtime and deployment config
├── app.json                   # Expo app config (name, slug, icons, plugins)
├── babel.config.js            # Babel presets, module-resolver, reanimated
├── drizzle.config.ts         # Drizzle Kit config (PostgreSQL, schema path)
├── eslint.config.js          # ESLint rules
├── package.json
├── package-lock.json
├── tsconfig.json              # TypeScript (paths: @/*, @shared/*)
├── design_guidelines.md       # Brand, colors, typography, screen specs
└── replit.md                  # Replit-specific docs
```

### Folder summary

| Path | Purpose |
|------|--------|
| **`assets/`** | Images and sounds used by the app; served as static files in production. |
| **`client/`** | Expo/React Native app: UI, game logic (via context), navigation, theme. Entry: `client/index.js` → `App.tsx`. |
| **`server/`** | Express app: CORS, body parsing, landing page, Expo manifest routing, static files; API routes go in `routes.ts`. |
| **`shared/`** | Drizzle schema and Zod validation shared by server (and future client API usage). |
| **`scripts/`** | Build automation (e.g. static Expo build for deployment). |

---

## Languages

| Language | Where it's used |
|----------|------------------|
| **TypeScript** | All app logic and config that is type-checked: `client/**/*.tsx`, `client/**/*.ts`, `server/*.ts`, `shared/schema.ts`, `drizzle.config.ts`. |
| **JavaScript** | `client/index.js` (Expo entry), `babel.config.js`, `scripts/build.js`, `eslint.config.js`. |
| **JSON** | `package.json`, `app.json`, and other config. |
| **HTML** | `server/templates/landing-page.html`. |

The codebase is **strict TypeScript** (`tsconfig.json`: `"strict": true`) with path aliases:

- `@/*` → `./client/*`
- `@shared/*` → `./shared/*`

(Babel `module-resolver` mirrors these for the bundler.)

---

## Technology Stack

### Frontend (client)

| Category | Technology |
|----------|------------|
| **Framework** | **Expo SDK 54** (React Native 0.81.5, React 19.1.0) |
| **Navigation** | **React Navigation 7** — `@react-navigation/native`, `native-stack`; optional tabs/elements. |
| **UI / UX** | **React Native Reanimated**, **react-native-gesture-handler**, **react-native-screens**, **react-native-safe-area-context**, **react-native-svg**. |
| **Expo modules** | expo-splash-screen, expo-status-bar, expo-haptics, expo-audio, expo-font (Nunito), expo-image, expo-blur, expo-constants, expo-linking, expo-web-browser, expo-system-ui, expo-symbols. |
| **State / data** | React Context (`GameContext`), **@tanstack/react-query**, **@react-native-async-storage/async-storage**. |
| **Validation** | **Zod** (with shared schema). |

The app targets **iOS**, **Android**, and **web** (react-native-web). `app.json` enables **React Native New Architecture** and **React Compiler** (experiment).

### Backend (server)

| Category | Technology |
|----------|------------|
| **Runtime** | **Node.js** (tsx in dev, built ESM in prod). |
| **Framework** | **Express 5**. |
| **API / DB** | **Drizzle ORM** + **PostgreSQL** (schema in `shared/`); server currently uses in-memory **MemStorage** only (no DB required at runtime). |
| **Build** | **esbuild** — single ESM bundle to `server_dist/`. |

### Shared

| Category | Technology |
|----------|------------|
| **Schema / validation** | **Drizzle** (`shared/schema.ts`), **drizzle-zod**, **Zod**. |
| **Database** | **PostgreSQL** (via `pg`); used only when API/storage is wired to DB (e.g. `db:push`). |

### Development and tooling

| Category | Technology |
|----------|------------|
| **Language** | **TypeScript 5.9** (strict). |
| **Bundler / dev server** | **Metro** (Expo). |
| **Linting** | **ESLint** (eslint-config-expo, eslint-config-prettier, eslint-plugin-prettier). |
| **Formatting** | **Prettier**. |
| **Path aliases** | **babel-plugin-module-resolver** (Babel) + `tsconfig.json` paths. |
| **DB migrations / introspect** | **Drizzle Kit** (`drizzle.config.ts`; requires `DATABASE_URL`). |

### Deployment (Replit)

The project is set up for **Replit** (see `.replit`): build runs `expo:static:build` then `server:build`; production runs `server:prod` (Node serving static Expo build + landing). Optional deployment target: **Cloud Run**.

---

## Configuration Files

| File | Purpose |
|------|--------|
| **`app.json`** | Expo app config: name ("Tower Rescue"), slug, version, icon, splash, scheme, iOS/Android/web settings, plugins (splash, web-browser), experiments (React Compiler). |
| **`package.json`** | Dependencies, scripts; `main` is `client/index.js`. |
| **`tsconfig.json`** | Extends Expo base; strict mode; path aliases `@/*`, `@shared/*`; includes all `.ts`/`.tsx`. |
| **`babel.config.js`** | `babel-preset-expo`; `module-resolver` for `@` and `@shared`; `react-native-reanimated/plugin` (must be last). |
| **`drizzle.config.ts`** | Drizzle Kit: PostgreSQL dialect, schema at `./shared/schema.ts`, migrations out to `./migrations`; requires `DATABASE_URL`. |
| **`eslint.config.js`** | ESLint configuration for the repo. |
| **`.replit`** | Replit entrypoint, Node version, deployment (build/run), ports, env (e.g. `PORT`), workflows. |

---

## Scripts

| Script | Command | Description |
|--------|--------|-------------|
| **expo:dev** | `npm run expo:dev` | Start Expo dev server (Replit-oriented env vars). For local dev, `npx expo start` is often used instead. |
| **server:dev** | `npm run server:dev` | Run Express server in development with `tsx` (default port 5000). |
| **expo:static:build** | `npm run expo:static:build` | Full static Expo build (Metro, bundle download, manifests) — used for deployment. |
| **server:build** | `npm run server:build` | Bundle server with esbuild into `server_dist/`. |
| **server:prod** | `npm run server:prod` | Run production server from `server_dist/`. |
| **db:push** | `npm run db:push` | Push schema to DB (requires `DATABASE_URL`). |
| **lint** | `npm run lint` | Run ESLint. |
| **lint:fix** | `npm run lint:fix` | ESLint with auto-fix. |
| **check:types** | `npm run check:types` | TypeScript check (`tsc --noEmit`). |
| **check:format** | `npm run check:format` | Prettier check. |
| **format** | `npm run format` | Prettier write. |

---

## Running with Docker (e.g. WSL)

The app can run in a container using a production-style build (static Expo assets + Express server).

**Prerequisites:** Docker (and Docker Compose if you use the compose file). On WSL2, install Docker Engine or use Docker Desktop with WSL2 backend.

**Build and run with Docker Compose:**

```bash
docker compose up --build
```

Then open **http://localhost:5000** in your browser. The first build can take several minutes (Metro bundle generation).

**Or build and run with plain Docker:**

```bash
docker build -t tower-rescue .
docker run -p 5000:5000 tower-rescue
```

- **Port:** The server listens on `5000` inside the container; `-p 5000:5000` maps it to your host (WSL or Windows).
- **Asset URLs:** The image is built with `EXPO_PUBLIC_DOMAIN=localhost`, so the web app expects to be served at `http://localhost:5000`. If you use a different host or port, rebuild with `--build-arg` or override the domain in a custom Dockerfile.

---

## Publishing the image to Docker Hub

1. **Create a Docker Hub account** (if you don’t have one): [hub.docker.com](https://hub.docker.com) → Sign up.

2. **Log in from your machine** (WSL or PowerShell):
   ```bash
   docker login
   ```
   Enter your Docker Hub username and password (or access token).

3. **Build the image** (from the project root):
   ```bash
   docker build -t tower-rescue .
   ```

4. **Tag the image for your Docker Hub repo**  
   Replace `YOUR_DOCKERHUB_USERNAME` with your actual username. Use the same name for the repo if you want `docker pull YOUR_DOCKERHUB_USERNAME/tower-rescue` to work.
   ```bash
   docker tag tower-rescue YOUR_DOCKERHUB_USERNAME/tower-rescue:latest
   ```
   Optional version tag:
   ```bash
   docker tag tower-rescue YOUR_DOCKERHUB_USERNAME/tower-rescue:1.0.0
   ```

5. **Push to Docker Hub**:
   ```bash
   docker push YOUR_DOCKERHUB_USERNAME/tower-rescue:latest
   ```
   If you tagged a version:
   ```bash
   docker push YOUR_DOCKERHUB_USERNAME/tower-rescue:1.0.0
   ```

6. **Create the repo on Docker Hub (if needed)**  
   If the repo doesn’t exist yet, go to [hub.docker.com](https://hub.docker.com) → **Create Repository** → name it `tower-rescue` (or the name you used in the tag). You can push first and Docker Hub will create the repo when the name matches.

**Run the published image (anyone with the name):**
```bash
docker pull YOUR_DOCKERHUB_USERNAME/tower-rescue:latest
docker run -p 5000:5000 YOUR_DOCKERHUB_USERNAME/tower-rescue:latest
```

---

For design (colors, typography, screens), see **`design_guidelines.md`**.
