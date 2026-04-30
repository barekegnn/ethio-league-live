# Design Document: Ethiopian Football League Public Platform

## Overview

The Ethiopian Football League Public Platform is a mobile-first, public-facing web application that provides Ethiopian football fans with immersive match experiences, comprehensive player and team discovery, league intelligence, and rich media content. The platform is built as a **completely separate repository** from the admin backend, consuming data via public REST API endpoints.

### Design Philosophy

The platform draws inspiration from SofaScore's clean, minimalist interface with a focus on:
- **Mobile-first approach**: Every component designed for smartphones first (320px-640px)
- **Instant information hierarchy**: Scores, time, and key stats prominently displayed
- **Smooth interactions**: Gesture-based navigation, micro-animations, optimistic UI
- **Real-time updates**: Live match data with seamless refresh mechanisms
- **Progressive enhancement**: Desktop and tablet as enhanced experiences

### Key Design Principles

1. **Performance First**: Target Lighthouse score >90, FCP <1.5s on 3G
2. **Accessibility**: WCAG 2.1 AA compliance with screen reader support
3. **Internationalization**: English and Amharic language support
4. **Offline Capability**: PWA with service worker caching
5. **SEO Optimization**: SSR with Schema.org structured data
6. **Ethiopian Context**: Prioritize Premier League → Super League → National League

---

## Architecture

### Separate Repository Structure

The frontend and backend are maintained as **completely separate repositories**:

**Backend Repository:** `ethio-league` (admin system)
- Next.js 14 admin dashboard
- PostgreSQL database with Prisma ORM
- Public REST API endpoints at `/api/*`
- Deployed to: `admin.efl.et` or `api.efl.et`
- Port: 3000

**Frontend Repository:** `ethio-league-public` (this project)
- Next.js 14 public-facing platform
- Consumes backend API via HTTP requests
- No direct database access
- Deployed to: `efl.et` or `www.efl.et`
- Port: 3001

### Communication Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Port 3001)                  │
│                  ethio-league-public                     │
│                                                          │
│  ┌────────────┐      ┌──────────────┐                  │
│  │  Next.js   │──────│  SWR + Axios │                  │
│  │  Pages     │      │  API Client  │                  │
│  └────────────┘      └──────┬───────┘                  │
└─────────────────────────────┼────────────────────────────┘
                              │
                              │ HTTP/REST
                              │ (CORS enabled)
                              │
┌─────────────────────────────▼────────────────────────────┐
│                    Backend (Port 3000)                    │
│                     ethio-league                          │
│                                                           │
│  ┌──────────────┐      ┌──────────────┐                 │
│  │  Public API  │──────│   Prisma     │                 │
│  │  /api/*      │      │   Client     │                 │
│  └──────────────┘      └──────┬───────┘                 │
│                                │                          │
│                        ┌───────▼────────┐                │
│                        │   PostgreSQL   │                │
│                        └────────────────┘                │
└───────────────────────────────────────────────────────────┘
```

### Project Structure
### Project Structure

```
ethio-league-public/                # Frontend repository (separate from backend)
├── app/                            # Next.js 14 App Router
```
ethio-league-public/                # Frontend repository (separate from backend)
├── app/                            # Next.js 14 App Router
│   ├── (home)/
│   │   └── page.tsx                # Home page with hero, live scores
│   ├── leagues/
│   │   ├── page.tsx                # League directory
│   │   └── [leagueId]/
│   │       └── seasons/
│   │           └── [seasonId]/
│   │               └── page.tsx    # Season overview
│   ├── matches/
│   │   ├── page.tsx                # Fixtures/results
│   │   └── [matchId]/
│   │       └── page.tsx            # Match center
│   ├── clubs/
│   │   ├── page.tsx                # Club directory
│   │   └── [clubId]/
│   │       └── page.tsx            # Club profile
│   ├── players/
│   │   └── [playerId]/
│   │       └── page.tsx            # Player profile (no directory)
│   ├── coaches/
│   │   └── [coachId]/
│   │       └── page.tsx            # Coach profile
│   ├── search/
│   │   └── page.tsx                # Search results
│   ├── layout.tsx                  # Root layout
│   ├── error.tsx                   # Error boundary
│   └── not-found.tsx               # 404 page
│
├── components/                     # React components
│   ├── ui/                         # shadcn/ui components
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── BottomNav.tsx
│   │   └── MobileMenu.tsx
│   ├── match/
│   │   ├── MatchCard.tsx
│   │   ├── LiveScoreTicker.tsx
│   │   ├── MatchTimeline.tsx
│   │   └── MatchStats.tsx
│   ├── league/
│   │   ├── StandingsTable.tsx
│   │   ├── FormGuide.tsx
│   │   └── TopScorersWidget.tsx
│   ├── club/
│   │   ├── ClubCard.tsx
│   │   ├── SquadList.tsx
│   │   └── ClubStats.tsx
│   ├── player/
│   │   ├── PlayerCard.tsx
│   │   ├── PlayerStats.tsx
│   │   └── CareerTimeline.tsx
│   ├── shared/
│   │   ├── SearchBar.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── SkeletonLoader.tsx
│   │   ├── EmptyState.tsx
│   │   └── ErrorBoundary.tsx
│   └── media/
│       ├── ImageGallery.tsx
│       ├── VideoPlayer.tsx
│       └── Lightbox.tsx
│
├── lib/                            # Utilities and helpers
│   ├── api/
│   │   ├── client.ts               # Axios client configuration
│   │   ├── endpoints.ts            # API endpoint definitions
│   │   └── hooks/                  # Custom SWR hooks
│   │       ├── useMatches.ts
│   │       ├── useStandings.ts
│   │       ├── usePlayers.ts
│   │       └── useClubs.ts
│   ├── utils/
│   │   ├── date.ts                 # Date formatting
│   │   ├── format.ts               # Number/text formatting
│   │   └── validation.ts           # Input validation
│   ├── cloudinary.ts               # Cloudinary integration
│   └── analytics.ts                # Analytics tracking
│
├── types/                          # TypeScript type definitions
│   ├── entities.ts                 # Entity types (based on API responses)
│   ├── api.ts                      # API response types
│   └── index.ts
│
├── hooks/                          # Custom React hooks
│   ├── useMediaQuery.ts
│   ├── useIntersectionObserver.ts
│   ├── useLocalStorage.ts
│   └── useTheme.ts
│
├── styles/
│   └── globals.css                 # Tailwind + custom styles
│
├── public/
│   ├── manifest.json               # PWA manifest
│   ├── sw.js                       # Service worker
│   ├── icons/                      # App icons
│   └── images/
│
├── messages/                       # i18n translations
│   ├── en.json
│   └── am.json
│
├── .env.local                      # Environment variables
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── README.md
```

### Environment Configuration

```env
# .env.local

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```
```

### Technology Stack

**Frontend Framework**
- Next.js 14 (App Router) - SSR, SSG, API routes
- React 19 - UI components
- TypeScript - Type safety

**Styling**
- Tailwind CSS - Utility-first styling
- shadcn/ui - Component library
- Lucide React - Icon library

**Data Fetching**
- SWR - Stale-while-revalidate caching
- Axios - HTTP client for backend API

**Media Delivery**
- Cloudinary - CDN and image optimization

**Internationalization**
- next-intl - i18n support

**PWA**
- next-pwa - Service worker and manifest generation

**Analytics & Monitoring**
- Vercel Analytics - Performance monitoring
- Sentry - Error tracking
- Google Analytics / Plausible - User analytics

**Testing**
- Vitest - Unit testing
- React Testing Library - Component testing
- Playwright - E2E testing
- Lighthouse CI - Performance testing

**Package Management**
- npm or pnpm - Dependency management

### Backend API Integration

The frontend communicates with the backend exclusively through REST API endpoints:

**API Base URL:** `http://localhost:3000/api` (development) or `https://api.efl.et` (production)

**Key Endpoints:**
- `GET /api/matches` - List matches
- `GET /api/matches/:id` - Match details
- `GET /api/leagues` - List leagues
- `GET /api/seasons/:id/standings` - Season standings
- `GET /api/clubs` - List clubs
- `GET /api/clubs/:id` - Club details
- `GET /api/players/:id` - Player details
- `GET /api/search?q=query` - Search

**CORS Configuration (Backend):**
The backend must allow requests from the frontend domain:

```typescript
// Backend: middleware.ts or API route
const allowedOrigins = [
  'http://localhost:3001',  // Local development
  'https://efl.et',         // Production
  'https://www.efl.et',     // Production with www
];
```

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Vercel / Netlify / Cloudflare              │
│                   (Frontend Hosting)                     │
│                     efl.et                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS/REST
                     │ (CORS enabled)
                     │
┌────────────────────▼─────────────────────────────────────┐
│              Vercel / Railway / AWS                       │
│                (Backend Hosting)                          │
│                  api.efl.et                               │
│                                                           │
│  ┌──────────────┐      ┌──────────────┐                 │
│  │  Public API  │──────│   Prisma     │                 │
│  │  /api/*      │      │   Client     │                 │
│  └──────────────┘      └──────┬───────┘                 │
│                                │                          │
│                        ┌───────▼────────┐                │
│                        │   PostgreSQL   │                │
│                        └────────────────┘                │
└───────────────────────────────────────────────────────────┘
                     │
                     │
            ┌────────▼────────┐
            │   Cloudinary    │
            │   (Media CDN)   │
            └─────────────────┘
```

**Deployment Strategy:**
- Frontend and backend deploy independently
- Frontend: Static site generation where possible, SSR for dynamic pages
- Backend: API server with database connection
- Media: Cloudinary CDN for global delivery

---

## Components and Interfaces

### Core Component Architecture

#### 1. Layout Components

**Header Component**
```typescript
interface HeaderProps {
  locale: 'en' | 'am';
  theme: 'light' | 'dark';
}

// Features:
// - Logo and branding
// - Search bar with autocomplete
// - Language switcher
// - Theme toggle
// - Mobile: Hamburger menu
// - Desktop: Full navigation menu
```

**BottomNav Component (Mobile)**
```typescript
interface BottomNavProps {
  activeRoute: string;
}

// Navigation items:
// - Home (house icon)
// - Matches (calendar icon)
// - Leagues (trophy icon)
// - Favorites (star icon)
// - More (menu icon)
```

**Footer Component**
```typescript
interface FooterProps {
  locale: 'en' | 'am';
}

// Features:
// - Links: About, Privacy, Terms, Contact
// - Social media links
// - Copyright notice
// - Language selector
```

#### 2. Match Components

**MatchCard Component**
```typescript
interface MatchCardProps {
  match: {
    id: string;
    homeClub: { id: string; name: string; logo: string };
    awayClub: { id: string; name: string; logo: string };
    homeScore: number | null;
    awayScore: number | null;
    status: 'scheduled' | 'live' | 'completed';
    startTime: Date;
    minute: number | null;
    stadium: string;
    league: { name: string; tier: number };
  };
  variant: 'compact' | 'detailed';
  onPress: () => void;
}

// Variants:
// - compact: For lists and tickers (minimal info)
// - detailed: For hero section (full info + CTA)
```

**LiveScoreTicker Component**
```typescript
interface LiveScoreTickerProps {
  matches: Match[];
  autoScroll: boolean;
  refreshInterval: number; // milliseconds
}

// Features:
// - Horizontal scrolling container
// - Auto-refresh every 15s
// - Swipeable on mobile
// - Click to navigate to match center
```

**MatchTimeline Component**
```typescript
interface MatchTimelineProps {
  events: MatchEvent[];
  homeClubId: string;
  awayClubId: string;
}

interface MatchEvent {
  id: string;
  minute: number;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'injury';
  player: { id: string; name: string; photo: string };
  clubId: string;
  description: string;
}

// Features:
// - Chronological timeline (newest first)
// - Event type icons with color coding
// - Player photos and names
// - Animated entry for new events
```

**MatchStats Component**
```typescript
interface MatchStatsProps {
  stats: {
    possession: { home: number; away: number };
    shots: { home: number; away: number };
    shotsOnTarget: { home: number; away: number };
    corners: { home: number; away: number };
    fouls: { home: number; away: number };
    offsides: { home: number; away: number };
    yellowCards: { home: number; away: number };
    redCards: { home: number; away: number };
  };
}

// Features:
// - Progress bars for comparative stats
// - Percentage indicators
// - Color-coded values
```

#### 3. League Components

**StandingsTable Component**
```typescript
interface StandingsTableProps {
  standings: StandingRow[];
  highlightClubId?: string;
  showForm: boolean;
  responsive: boolean;
}

interface StandingRow {
  position: number;
  club: { id: string; name: string; logo: string };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

// Features:
// - Color-coded positions (promotion/relegation zones)
// - Form guide with tooltips
// - Responsive: collapse columns on mobile
// - Click row to navigate to club profile
```

**FormGuide Component**
```typescript
interface FormGuideProps {
  form: {
    result: 'W' | 'D' | 'L';
    opponent: string;
    score: string;
    date: Date;
  }[];
  maxItems: number;
}

// Features:
// - Color-coded indicators (green/gray/red)
// - Tooltip on hover with match details
// - Horizontal layout
```

**TopScorersWidget Component**
```typescript
interface TopScorersWidgetProps {
  scorers: {
    player: { id: string; name: string; photo: string };
    club: { id: string; name: string; logo: string };
    goals: number;
  }[];
  limit: number;
}

// Features:
// - Player photos and names
// - Club logos
// - Goal count badges
// - Click to navigate to player profile
```

#### 4. Club Components

**ClubCard Component**
```typescript
interface ClubCardProps {
  club: {
    id: string;
    name: string;
    logo: string;
    stadium: string;
    founded: number;
  };
  variant: 'grid' | 'list';
}

// Variants:
// - grid: For directory pages (card layout)
// - list: For search results (row layout)
```

**SquadList Component**
```typescript
interface SquadListProps {
  players: {
    id: string;
    name: string;
    photo: string;
    jerseyNumber: number;
    position: string;
    nationality: string;
    age: number;
    height: number;
  }[];
  groupByPosition: boolean;
}

// Features:
// - Grouped by position (GK, DEF, MID, FWD)
// - Player cards with photos
// - Click to navigate to player profile
```

#### 5. Player Components

**PlayerCard Component**
```typescript
interface PlayerCardProps {
  player: {
    id: string;
    name: string;
    photo: string;
    position: string;
    club: { name: string; logo: string };
    nationality: string;
  };
  variant: 'grid' | 'list';
}
```

**PlayerStats Component**
```typescript
interface PlayerStatsProps {
  stats: {
    season: string;
    club: string;
    appearances: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
  }[];
  showCharts: boolean;
}

// Features:
// - Season-by-season table
// - Career totals row
// - Charts: goals/assists per season
```

**CareerTimeline Component**
```typescript
interface CareerTimelineProps {
  career: {
    club: { id: string; name: string; logo: string };
    startDate: Date;
    endDate: Date | null;
    appearances: number;
    goals: number;
  }[];
}

// Features:
// - Vertical timeline with connecting line
// - Club logos and names
// - Date ranges
// - Stats per club
```

#### 6. Shared Components

**SearchBar Component**
```typescript
interface SearchBarProps {
  placeholder: string;
  onSearch: (query: string) => void;
  showAutocomplete: boolean;
}

interface AutocompleteResult {
  type: 'club' | 'coach' | 'match';  // NOTE: Players NOT searchable
  id: string;
  name: string;
  image: string;
  subtitle: string;
}

// Features:
// - Debounced input (300ms)
// - Autocomplete dropdown after 2 characters
// - Keyboard navigation (arrow keys, enter)
// - Mobile: Full-screen search overlay
// - Search categories: Clubs, Coaches, Matches (Players accessed via clubs/matches/leaderboards)
```

**FilterPanel Component**
```typescript
interface FilterPanelProps {
  filters: Filter[];
  activeFilters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
}

interface Filter {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'date';
  options?: { value: string; label: string }[];
}

// Features:
// - Desktop: Sidebar panel
// - Mobile: Bottom sheet
// - Clear all button
// - Apply button
// - Update URL query params
```

**SkeletonLoader Component**
```typescript
interface SkeletonLoaderProps {
  variant: 'card' | 'table' | 'list' | 'text';
  count: number;
}

// Features:
// - Matches final content layout
// - Animated shimmer effect
// - Responsive sizing
```

**EmptyState Component**
```typescript
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Use cases:
// - No search results
// - No matches found
// - Empty favorites list
```

#### 7. Media Components

**ImageGallery Component**
```typescript
interface ImageGalleryProps {
  images: {
    id: string;
    url: string;
    thumbnail: string;
    alt: string;
    caption?: string;
  }[];
  columns: { mobile: number; tablet: number; desktop: number };
}

// Features:
// - Responsive grid layout
// - Lazy loading
// - Click to open lightbox
// - Cloudinary optimization
```

**VideoPlayer Component**
```typescript
interface VideoPlayerProps {
  video: {
    url: string;
    poster: string;
    title: string;
  };
  autoplay: boolean;
  controls: boolean;
}

// Features:
// - Adaptive bitrate streaming (HLS)
// - Custom controls
// - Fullscreen support
// - Mobile-optimized
```

**Lightbox Component**
```typescript
interface LightboxProps {
  images: { url: string; alt: string }[];
  initialIndex: number;
  onClose: () => void;
}

// Features:
// - Full-screen overlay
// - Swipe navigation (mobile)
// - Arrow navigation (desktop)
// - Zoom support
// - ESC key to close
```

### API Client Architecture

**SWR Configuration**
```typescript
// lib/api/client.ts
import useSWR, { SWRConfiguration } from 'swr';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export const swrConfig: SWRConfiguration = {
  fetcher,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 2000,
};

// Cache durations by data type
export const CACHE_DURATIONS = {
  LIVE_MATCH: 30 * 1000,        // 30 seconds
  STANDINGS: 5 * 60 * 1000,     // 5 minutes
  PROFILE: 60 * 60 * 1000,      // 1 hour
  HISTORICAL: 24 * 60 * 60 * 1000, // 24 hours
};
```

**Custom Hooks**
```typescript
// lib/api/hooks/useMatches.ts
export function useMatches(filters?: MatchFilters) {
  const params = new URLSearchParams(filters as any);
  const { data, error, mutate } = useSWR(
    `${API_BASE_URL}/matches?${params}`,
    {
      refreshInterval: filters?.status === 'live' ? CACHE_DURATIONS.LIVE_MATCH : 0,
    }
  );

  return {
    matches: data?.matches || [],
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
}

// lib/api/hooks/useStandings.ts
export function useStandings(seasonId: string) {
  const { data, error } = useSWR(
    `${API_BASE_URL}/seasons/${seasonId}/standings`,
    {
      refreshInterval: CACHE_DURATIONS.STANDINGS,
    }
  );

  return {
    standings: data?.standings || [],
    isLoading: !error && !data,
    isError: error,
  };
}

// lib/api/hooks/usePlayers.ts
export function usePlayer(playerId: string) {
  const { data, error } = useSWR(
    `${API_BASE_URL}/players/${playerId}`,
    {
      refreshInterval: CACHE_DURATIONS.PROFILE,
    }
  );

  return {
    player: data?.player,
    isLoading: !error && !data,
    isError: error,
  };
}
```

---

## Data Models

### Core Entity Types

The public platform consumes data from the admin backend. These TypeScript interfaces define the shape of data received from public API endpoints.

```typescript
// packages/types/src/entities.ts

export interface League {
  id: string;
  name: string;
  nameAmharic: string | null;
  logo: string | null;
  organizationId: string;
  genderCategory: 'male' | 'female' | 'mixed';
  ageCategory: 'senior' | 'youth' | 'junior';
  divisionLevel: number; // 1 = Premier, 2 = Super, 3 = National
  description: string | null;
  founded: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Season {
  id: string;
  leagueId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed';
  clubCount: number;
  totalMatches: number;
  totalGoals: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  league?: League;
}

export interface Club {
  id: string;
  name: string;
  nameAmharic: string | null;
  logo: string | null;
  founded: number | null;
  stadium: string | null;
  stadiumLocation: string | null;
  stadiumCapacity: number | null;
  colors: string | null;
  description: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  nationality: string;
  height: number | null; // cm
  weight: number | null; // kg
  preferredFoot: 'left' | 'right' | 'both' | null;
  photo: string | null;
  biography: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  nationality: string;
  licenseLevel: string | null;
  photo: string | null;
  biography: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Match {
  id: string;
  seasonId: string;
  homeClubId: string;
  awayClubId: string;
  matchDate: Date;
  stadium: string | null;
  status: 'scheduled' | 'live' | 'completed' | 'postponed' | 'cancelled';
  homeScore: number | null;
  awayScore: number | null;
  minute: number | null;
  attendance: number | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  season?: Season;
  homeClub?: Club;
  awayClub?: Club;
  events?: MatchEvent[];
  lineups?: MatchLineup[];
  statistics?: MatchStatistics;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  minute: number;
  eventTypeId: string;
  playerId: string | null;
  clubId: string;
  description: string | null;
  createdAt: Date;
  
  // Relations
  eventType?: EventType;
  player?: Player;
  club?: Club;
}

export interface EventType {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

export interface MatchLineup {
  id: string;
  matchId: string;
  clubId: string;
  playerId: string;
  position: string;
  jerseyNumber: number;
  isStarting: boolean;
  isCaptain: boolean;
  
  // Relations
  player?: Player;
}

export interface MatchStatistics {
  matchId: string;
  homePossession: number;
  awayPossession: number;
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homeCorners: number;
  awayCorners: number;
  homeFouls: number;
  awayFouls: number;
  homeOffsides: number;
  awayOffsides: number;
  homeYellowCards: number;
  awayYellowCards: number;
  homeRedCards: number;
  awayRedCards: number;
}

export interface Standing {
  position: number;
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
  
  // Relations
  club?: Club;
}

export interface PlayerSeasonStats {
  playerId: string;
  seasonId: string;
  clubId: string;
  appearances: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  
  // Relations
  player?: Player;
  season?: Season;
  club?: Club;
}

export interface ClubSeasonStats {
  clubId: string;
  seasonId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position: number;
  cleanSheets: number;
  
  // Relations
  club?: Club;
  season?: Season;
}

export interface MediaItem {
  id: string;
  entityType: 'club' | 'player' | 'coach' | 'match';
  entityId: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string | null;
  caption: string | null;
  uploadedAt: Date;
}
```

### API Response Types

```typescript
// packages/types/src/api.ts

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MatchListResponse {
  matches: Match[];
  total: number;
}

export interface StandingsResponse {
  standings: Standing[];
  seasonId: string;
  seasonName: string;
}

export interface TopScorersResponse {
  scorers: {
    player: Player;
    club: Club;
    goals: number;
    assists: number;
  }[];
  seasonId: string;
}

export interface SearchResults {
  clubs: Club[];
  coaches: Coach[];
  matches: Match[];
  total: number;
  // NOTE: Players NOT included - accessed via clubs, matches, leaderboards
}

export interface ClubProfileResponse {
  club: Club;
  currentSeason: {
    standing: Standing;
    stats: ClubSeasonStats;
    upcomingMatches: Match[];
    recentMatches: Match[];
  };
  squad: {
    player: Player;
    position: string;
    jerseyNumber: number;
  }[];
  coaches: {
    coach: Coach;
    role: string;
  }[];
}

export interface PlayerProfileResponse {
  player: Player;
  currentClub: Club | null;
  currentSeasonStats: PlayerSeasonStats | null;
  careerStats: {
    totalAppearances: number;
    totalGoals: number;
    totalAssists: number;
    totalYellowCards: number;
    totalRedCards: number;
  };
  seasonStats: PlayerSeasonStats[];
  careerHistory: {
    club: Club;
    startDate: Date;
    endDate: Date | null;
    appearances: number;
    goals: number;
  }[];
  recentMatches: Match[];
}

export interface MatchCenterResponse {
  match: Match;
  events: MatchEvent[];
  lineups: {
    home: MatchLineup[];
    away: MatchLineup[];
  };
  statistics: MatchStatistics | null;
  headToHead: Match[];
}
```

### Local State Types

```typescript
// apps/public-platform/lib/types.ts

export interface FilterState {
  leagues?: string[];
  seasons?: string[];
  clubs?: string[];
  status?: ('scheduled' | 'live' | 'completed')[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SearchState {
  query: string;
  results: SearchResults | null;
  isLoading: boolean;
  error: Error | null;
}

export interface ThemeState {
  mode: 'light' | 'dark';
  systemPreference: 'light' | 'dark';
}

export interface LocaleState {
  locale: 'en' | 'am';
  messages: Record<string, string>;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  locale: 'en' | 'am';
  favoriteClubs: string[];
  notificationsEnabled: boolean;
}
```

---

## Error Handling

### Error Boundary Strategy

**Global Error Boundary**
```typescript
// app/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error tracking service
    console.error('Global error:', error);
    // Send to Sentry
    if (typeof window !== 'undefined') {
      // Sentry.captureException(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">
          We're sorry, but something unexpected happened. Please try again.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
```

**Custom 404 Page**
```typescript
// app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/search">Search</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### API Error Handling

**Error Types**
```typescript
// lib/api/errors.ts

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(
    public message: string,
    public fields?: Record<string, string>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

**Error Handler**
```typescript
// lib/api/client.ts

import axios, { AxiosError } from 'axios';

export async function handleApiError(error: unknown): Promise<never> {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message: string }>;
    
    if (!axiosError.response) {
      // Network error
      throw new NetworkError('Unable to connect to server');
    }
    
    const { status, data } = axiosError.response;
    
    switch (status) {
      case 400:
        throw new ValidationError(data.message || 'Invalid request');
      case 404:
        throw new ApiError(404, 'Resource not found');
      case 429:
        throw new ApiError(429, 'Too many requests. Please try again later.');
      case 500:
        throw new ApiError(500, 'Server error. Please try again later.');
      default:
        throw new ApiError(status, data.message || 'An error occurred');
    }
  }
  
  throw error;
}

// Axios interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => handleApiError(error)
);
```

### User-Facing Error Messages

**Error Message Component**
```typescript
// components/shared/ErrorMessage.tsx

interface ErrorMessageProps {
  error: Error;
  retry?: () => void;
}

export function ErrorMessage({ error, retry }: ErrorMessageProps) {
  const getMessage = () => {
    if (error instanceof NetworkError) {
      return {
        title: 'Connection Error',
        description: 'Please check your internet connection and try again.',
      };
    }
    
    if (error instanceof ApiError) {
      if (error.statusCode === 404) {
        return {
          title: 'Not Found',
          description: 'The content you're looking for doesn't exist.',
        };
      }
      
      if (error.statusCode === 429) {
        return {
          title: 'Too Many Requests',
          description: 'Please wait a moment before trying again.',
        };
      }
    }
    
    return {
      title: 'Something Went Wrong',
      description: 'An unexpected error occurred. Please try again.',
    };
  };
  
  const { title, description } = getMessage();
  
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      {retry && (
        <Button onClick={retry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}
```

### Loading States

**Skeleton Loaders**
```typescript
// components/shared/SkeletonLoader.tsx

export function MatchCardSkeleton() {
  return (
    <div className="rounded-lg border p-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
        <div className="h-6 w-12 bg-muted rounded" />
        <div className="flex items-center gap-3">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-10 w-10 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function StandingsTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
          <div className="h-4 w-8 bg-muted rounded" />
          <div className="h-8 w-8 rounded-full bg-muted" />
          <div className="h-4 flex-1 bg-muted rounded" />
          <div className="h-4 w-12 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}
```

**Empty States**
```typescript
// components/shared/EmptyState.tsx

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="mb-4 text-muted-foreground">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}

// Usage examples:
// <EmptyState
//   icon={<Search className="h-12 w-12" />}
//   title="No results found"
//   description="Try adjusting your search or filters"
//   action={{ label: "Clear filters", onClick: clearFilters }}
// />
```

### Toast Notifications

**Toast System**
```typescript
// lib/toast.ts
import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message: string) => {
    sonnerToast.success(message);
  },
  
  error: (message: string) => {
    sonnerToast.error(message);
  },
  
  info: (message: string) => {
    sonnerToast.info(message);
  },
  
  loading: (message: string) => {
    return sonnerToast.loading(message);
  },
};

// Usage:
// toast.success('Match added to favorites');
// toast.error('Failed to load data');
```

---

## Testing Strategy

### Overview

The Ethiopian Football League Public Platform requires a comprehensive testing strategy that addresses its unique characteristics as a mobile-first, UI-heavy application with real-time data requirements. Given the nature of this feature, **property-based testing is NOT appropriate** because:

1. The platform is primarily focused on UI rendering and layout
2. Infrastructure configuration (monorepo, PWA, deployment)
3. Integration with existing backend APIs (consumption, not transformation)
4. User interactions and visual feedback

Instead, the testing strategy emphasizes:
- **Component testing** for UI components
- **Integration testing** for API consumption and data flow
- **E2E testing** for critical user journeys
- **Visual regression testing** for UI consistency
- **Performance testing** for mobile optimization
- **Accessibility testing** for WCAG compliance

### Testing Pyramid

```
                    ┌─────────────┐
                    │   E2E (5%)  │  Playwright
                    └─────────────┘
                  ┌───────────────────┐
                  │ Integration (15%) │  Vitest + MSW
                  └───────────────────┘
              ┌─────────────────────────────┐
              │   Component Tests (40%)     │  Vitest + RTL
              └─────────────────────────────┘
          ┌───────────────────────────────────────┐
          │   Unit Tests (40%)                    │  Vitest
          └───────────────────────────────────────┘
```

### Unit Testing

**Scope**: Pure utility functions, helpers, formatters, validators

**Tools**: Vitest

**Examples**:
```typescript
// lib/utils/date.test.ts
import { describe, it, expect } from 'vitest';
import { formatMatchDate, getTimeUntilKickoff } from './date';

describe('formatMatchDate', () => {
  it('formats date in English locale', () => {
    const date = new Date('2024-03-15T15:00:00Z');
    expect(formatMatchDate(date, 'en')).toBe('March 15, 2024');
  });
  
  it('formats date in Amharic locale', () => {
    const date = new Date('2024-03-15T15:00:00Z');
    expect(formatMatchDate(date, 'am')).toContain('2024');
  });
});

describe('getTimeUntilKickoff', () => {
  it('returns correct countdown for future match', () => {
    const kickoff = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
    const result = getTimeUntilKickoff(kickoff);
    expect(result.hours).toBe(2);
    expect(result.minutes).toBeLessThanOrEqual(60);
  });
  
  it('returns null for past match', () => {
    const kickoff = new Date(Date.now() - 1000);
    expect(getTimeUntilKickoff(kickoff)).toBeNull();
  });
});
```

```typescript
// lib/utils/format.test.ts
import { describe, it, expect } from 'vitest';
import { formatNumber, formatPercentage, truncateText } from './format';

describe('formatNumber', () => {
  it('formats numbers with locale-specific separators', () => {
    expect(formatNumber(1000, 'en')).toBe('1,000');
    expect(formatNumber(1000000, 'en')).toBe('1,000,000');
  });
});

describe('formatPercentage', () => {
  it('formats possession percentage', () => {
    expect(formatPercentage(0.653)).toBe('65%');
    expect(formatPercentage(0.5)).toBe('50%');
  });
});

describe('truncateText', () => {
  it('truncates long text with ellipsis', () => {
    const text = 'This is a very long description that needs truncation';
    expect(truncateText(text, 20)).toBe('This is a very long...');
  });
  
  it('does not truncate short text', () => {
    const text = 'Short text';
    expect(truncateText(text, 20)).toBe('Short text');
  });
});
```

### Component Testing

**Scope**: Individual React components in isolation

**Tools**: Vitest + React Testing Library

**Examples**:
```typescript
// components/match/MatchCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MatchCard } from './MatchCard';

describe('MatchCard', () => {
  const mockMatch = {
    id: '1',
    homeClub: { id: 'c1', name: 'St. George', logo: '/logo1.png' },
    awayClub: { id: 'c2', name: 'Ethiopian Coffee', logo: '/logo2.png' },
    homeScore: 2,
    awayScore: 1,
    status: 'completed' as const,
    startTime: new Date('2024-03-15T15:00:00Z'),
    minute: null,
    stadium: 'Addis Ababa Stadium',
    league: { name: 'Ethiopian Premier League', tier: 1 },
  };
  
  it('renders match information correctly', () => {
    render(<MatchCard match={mockMatch} variant="compact" onPress={() => {}} />);
    
    expect(screen.getByText('St. George')).toBeInTheDocument();
    expect(screen.getByText('Ethiopian Coffee')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });
  
  it('displays LIVE indicator for live matches', () => {
    const liveMatch = { ...mockMatch, status: 'live' as const, minute: 45 };
    render(<MatchCard match={liveMatch} variant="compact" onPress={() => {}} />);
    
    expect(screen.getByText('LIVE')).toBeInTheDocument();
    expect(screen.getByText("45'")).toBeInTheDocument();
  });
  
  it('calls onPress when clicked', () => {
    const onPress = vi.fn();
    render(<MatchCard match={mockMatch} variant="compact" onPress={onPress} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
  
  it('renders detailed variant with stadium info', () => {
    render(<MatchCard match={mockMatch} variant="detailed" onPress={() => {}} />);
    
    expect(screen.getByText('Addis Ababa Stadium')).toBeInTheDocument();
    expect(screen.getByText('Ethiopian Premier League')).toBeInTheDocument();
  });
});
```

```typescript
// components/league/StandingsTable.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StandingsTable } from './StandingsTable';

describe('StandingsTable', () => {
  const mockStandings = [
    {
      position: 1,
      club: { id: 'c1', name: 'St. George', logo: '/logo1.png' },
      played: 10,
      won: 8,
      drawn: 1,
      lost: 1,
      goalsFor: 25,
      goalsAgainst: 8,
      goalDifference: 17,
      points: 25,
      form: ['W', 'W', 'D', 'W', 'W'] as const,
    },
    {
      position: 2,
      club: { id: 'c2', name: 'Ethiopian Coffee', logo: '/logo2.png' },
      played: 10,
      won: 7,
      drawn: 2,
      lost: 1,
      goalsFor: 20,
      goalsAgainst: 10,
      goalDifference: 10,
      points: 23,
      form: ['W', 'D', 'W', 'W', 'L'] as const,
    },
  ];
  
  it('renders all standings rows', () => {
    render(<StandingsTable standings={mockStandings} showForm responsive />);
    
    expect(screen.getByText('St. George')).toBeInTheDocument();
    expect(screen.getByText('Ethiopian Coffee')).toBeInTheDocument();
  });
  
  it('displays correct statistics', () => {
    render(<StandingsTable standings={mockStandings} showForm responsive />);
    
    expect(screen.getByText('25')).toBeInTheDocument(); // points
    expect(screen.getByText('17')).toBeInTheDocument(); // goal difference
  });
  
  it('renders form guide when showForm is true', () => {
    render(<StandingsTable standings={mockStandings} showForm responsive />);
    
    // Form indicators should be present
    const formGuides = screen.getAllByTestId('form-guide');
    expect(formGuides).toHaveLength(2);
  });
  
  it('highlights specified club', () => {
    const { container } = render(
      <StandingsTable 
        standings={mockStandings} 
        highlightClubId="c1" 
        showForm 
        responsive 
      />
    );
    
    const highlightedRow = container.querySelector('[data-highlighted="true"]');
    expect(highlightedRow).toBeInTheDocument();
  });
});
```

### Integration Testing

**Scope**: API integration, data fetching, SWR hooks

**Tools**: Vitest + MSW (Mock Service Worker)

**Examples**:
```typescript
// lib/api/hooks/useMatches.test.ts
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { useMatches } from './useMatches';
import { SWRConfig } from 'swr';

const server = setupServer(
  http.get('/api/matches', () => {
    return HttpResponse.json({
      matches: [
        {
          id: '1',
          homeClub: { id: 'c1', name: 'St. George', logo: '/logo1.png' },
          awayClub: { id: 'c2', name: 'Ethiopian Coffee', logo: '/logo2.png' },
          status: 'live',
          homeScore: 1,
          awayScore: 0,
        },
      ],
      total: 1,
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useMatches', () => {
  it('fetches matches successfully', async () => {
    const wrapper = ({ children }) => (
      <SWRConfig value={{ provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );
    
    const { result } = renderHook(() => useMatches({ status: 'live' }), { wrapper });
    
    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.matches).toHaveLength(1);
    expect(result.current.matches[0].homeClub.name).toBe('St. George');
  });
  
  it('handles API errors', async () => {
    server.use(
      http.get('/api/matches', () => {
        return HttpResponse.json(
          { message: 'Server error' },
          { status: 500 }
        );
      })
    );
    
    const wrapper = ({ children }) => (
      <SWRConfig value={{ provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );
    
    const { result } = renderHook(() => useMatches(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isError).toBeTruthy();
    });
  });
});
```

### End-to-End Testing

**Scope**: Critical user journeys across multiple pages

**Tools**: Playwright

**Examples**:
```typescript
// e2e/home-page.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('displays hero section with featured match', async ({ page }) => {
    await page.goto('/');
    
    // Hero section should be visible
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
    
    // Should display team names
    await expect(page.locator('text=St. George')).toBeVisible();
    await expect(page.locator('text=Ethiopian Coffee')).toBeVisible();
  });
  
  test('displays live scores ticker when matches are live', async ({ page }) => {
    await page.goto('/');
    
    // Wait for live ticker to load
    const ticker = page.locator('[data-testid="live-ticker"]');
    await expect(ticker).toBeVisible();
    
    // Should display LIVE indicator
    await expect(page.locator('text=LIVE')).toBeVisible();
  });
  
  test('navigates to match center when clicking match card', async ({ page }) => {
    await page.goto('/');
    
    // Click first match card
    await page.locator('[data-testid="match-card"]').first().click();
    
    // Should navigate to match center
    await expect(page).toHaveURL(/\/matches\/[a-z0-9-]+/);
    
    // Match center should display
    await expect(page.locator('[data-testid="match-center"]')).toBeVisible();
  });
});

// e2e/search.spec.ts
test.describe('Search Functionality', () => {
  test('displays autocomplete suggestions', async ({ page }) => {
    await page.goto('/');
    
    // Type in search bar
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('St. George');
    
    // Wait for autocomplete
    await page.waitForTimeout(500);
    
    // Should display suggestions
    const suggestions = page.locator('[data-testid="autocomplete-item"]');
    await expect(suggestions).toHaveCount(1);
  });
  
  test('navigates to search results page on enter', async ({ page }) => {
    await page.goto('/');
    
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('football');
    await searchInput.press('Enter');
    
    // Should navigate to search page
    await expect(page).toHaveURL(/\/search\?q=football/);
    
    // Should display results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });
});

// e2e/mobile-navigation.spec.ts
test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } });
  
  test('displays bottom navigation on mobile', async ({ page }) => {
    await page.goto('/');
    
    const bottomNav = page.locator('[data-testid="bottom-nav"]');
    await expect(bottomNav).toBeVisible();
    
    // Should have 5 navigation items
    const navItems = bottomNav.locator('[role="button"]');
    await expect(navItems).toHaveCount(5);
  });
  
  test('navigates between pages using bottom nav', async ({ page }) => {
    await page.goto('/');
    
    // Click Matches tab
    await page.locator('[data-testid="nav-matches"]').click();
    await expect(page).toHaveURL('/matches');
    
    // Click Leagues tab
    await page.locator('[data-testid="nav-leagues"]').click();
    await expect(page).toHaveURL('/leagues');
  });
});
```

### Visual Regression Testing

**Scope**: UI consistency across components and pages

**Tools**: Playwright + Percy or Chromatic

**Examples**:
```typescript
// e2e/visual/components.spec.ts
import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test.describe('Visual Regression - Components', () => {
  test('match card - compact variant', async ({ page }) => {
    await page.goto('/styleguide/match-card');
    await percySnapshot(page, 'MatchCard - Compact');
  });
  
  test('match card - detailed variant', async ({ page }) => {
    await page.goto('/styleguide/match-card?variant=detailed');
    await percySnapshot(page, 'MatchCard - Detailed');
  });
  
  test('standings table - light mode', async ({ page }) => {
    await page.goto('/styleguide/standings-table');
    await percySnapshot(page, 'StandingsTable - Light');
  });
  
  test('standings table - dark mode', async ({ page }) => {
    await page.goto('/styleguide/standings-table');
    await page.emulateMedia({ colorScheme: 'dark' });
    await percySnapshot(page, 'StandingsTable - Dark');
  });
});
```

### Performance Testing

**Scope**: Page load times, Core Web Vitals, mobile performance

**Tools**: Lighthouse CI

**Configuration**:
```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3001/',
        'http://localhost:3001/matches',
        'http://localhost:3001/leagues',
        'http://localhost:3001/clubs/[club-id]',
        'http://localhost:3001/players/[player-id]',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### Accessibility Testing

**Scope**: WCAG 2.1 AA compliance, keyboard navigation, screen reader support

**Tools**: axe-core, Playwright

**Examples**:
```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('home page has no accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test('match center has no accessibility violations', async ({ page }) => {
    await page.goto('/matches/[match-id]');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test('keyboard navigation works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'search-input');
    
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'theme-toggle');
  });
  
  test('screen reader landmarks are present', async ({ page }) => {
    await page.goto('/');
    
    // Check for semantic HTML
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });
});
```

### Test Coverage Goals

- **Unit Tests**: 80% coverage for utility functions
- **Component Tests**: 70% coverage for UI components
- **Integration Tests**: Key API endpoints and data flows
- **E2E Tests**: All critical user journeys
- **Accessibility**: 100% of pages pass axe-core scans
- **Performance**: All pages meet Lighthouse thresholds

### Continuous Integration

**GitHub Actions Workflow**:
```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-and-component:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run unit and component tests
        run: pnpm test:unit --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
  
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Install Playwright
        run: pnpm exec playwright install --with-deps
      
      - name: Build app
        run: pnpm build
      
      - name: Run E2E tests
        run: pnpm test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
  
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build app
        run: pnpm build
      
      - name: Run Lighthouse CI
        run: pnpm exec lhci autorun
```

---

## Implementation Notes

### Mobile-First Development Workflow

1. **Design mobile layout first** (320px-640px)
2. **Test on real devices** (iOS Safari, Android Chrome)
3. **Add tablet breakpoints** (768px-1024px)
4. **Enhance for desktop** (1024px+)
5. **Verify touch targets** (minimum 44x44px)
6. **Test gestures** (swipe, pull-to-refresh)

### Performance Optimization Checklist

- [ ] Image optimization (WebP, responsive srcset)
- [ ] Code splitting (dynamic imports)
- [ ] Font optimization (font-display: swap)
- [ ] CDN for static assets (Cloudinary)
- [ ] Service worker caching
- [ ] Lazy loading (images, components)
- [ ] Prefetching (linked pages)
- [ ] Bundle size monitoring
- [ ] Lighthouse CI in pipeline

### Accessibility Checklist

- [ ] Semantic HTML (header, nav, main, footer)
- [ ] ARIA labels for interactive elements
- [ ] Keyboard navigation support
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Alt text for images
- [ ] Form labels associated
- [ ] Screen reader testing
- [ ] Reduced motion support

### SEO Checklist

- [ ] SSR for all public pages
- [ ] Unique title tags
- [ ] Meta descriptions
- [ ] Open Graph tags
- [ ] Twitter Card tags
- [ ] Schema.org structured data
- [ ] XML sitemap
- [ ] robots.txt
- [ ] Canonical URLs
- [ ] Internal linking

### Internationalization Checklist

- [ ] next-intl configured
- [ ] Translation files (en.json, am.json)
- [ ] Language switcher in header
- [ ] Locale persistence (localStorage)
- [ ] Date/number formatting
- [ ] HTML lang attribute
- [ ] RTL support (future)

### PWA Checklist

- [ ] manifest.json configured
- [ ] Service worker registered
- [ ] App icons (192px, 512px)
- [ ] Offline fallback page
- [ ] Install prompt
- [ ] Splash screen
- [ ] Theme color
- [ ] Lighthouse PWA score >90

---

## Deployment Strategy

### Environment Configuration

**Development**:
- Local: `http://localhost:3001`
- API: `http://localhost:3000/api`
- Database: Local PostgreSQL

**Staging**:
- URL: `https://staging.efl.et`
- API: `https://staging-api.efl.et`
- Database: Staging PostgreSQL (Vercel Postgres)

**Production**:
- URL: `https://efl.et`
- API: `https://api.efl.et`
- Database: Production PostgreSQL (Vercel Postgres)

### Deployment Pipeline

```
┌──────────────┐
│  Git Push    │
│  to main     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Run Tests   │
│  (CI)        │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Build App   │
│  (Next.js)   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Deploy to   │
│  Vercel      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Run Smoke   │
│  Tests       │
└──────────────┘
```

### Monitoring and Observability

**Performance Monitoring**:
- Vercel Analytics (Core Web Vitals)
- Real User Monitoring (RUM)

**Error Tracking**:
- Sentry (client-side errors)
- Error boundaries with logging

**User Analytics**:
- Google Analytics or Plausible
- Custom event tracking

**Uptime Monitoring**:
- Vercel health checks
- External monitoring (UptimeRobot)

---

## Security Considerations

### API Security

- **Rate Limiting**: 100 requests/minute per IP
- **CORS**: Whitelist public domain
- **Input Sanitization**: All user input sanitized
- **XSS Prevention**: Content Security Policy headers
- **HTTPS Only**: Force SSL redirect

### Data Privacy

- **GDPR Compliance**: Cookie consent banner
- **Privacy Policy**: Clear data usage explanation
- **User Data**: Minimal collection (favorites, preferences)
- **Analytics**: IP anonymization

### Content Security

- **CSP Headers**: Restrict script sources
- **Subresource Integrity**: For CDN resources
- **Secure Cookies**: httpOnly, secure flags
- **CSRF Protection**: For state-changing operations

---

## Future Enhancements

### Phase 2 Features

1. **User Accounts**: Registration, login, profile management
2. **Favorites**: Save favorite clubs, players, matches
3. **Notifications**: Email and push notifications for goals, match start
4. **Comments**: User comments on matches and news
5. **Predictions**: Match prediction game
6. **Fantasy League**: Fantasy football game

### Phase 3 Features

1. **Live Streaming**: Video streaming integration
2. **Live Chat**: Real-time chat during matches
3. **Social Features**: User profiles, following, activity feed
4. **Mobile Apps**: Native iOS and Android apps
5. **Advanced Analytics**: Player heat maps, pass networks
6. **AI Features**: Match predictions, player recommendations

---

## Conclusion

The Ethiopian Football League Public Platform design emphasizes mobile-first development, performance optimization, and accessibility. The monorepo architecture enables code sharing between admin and public apps while maintaining independent deployment. The testing strategy focuses on component testing, integration testing, and E2E testing rather than property-based testing, which is appropriate for this UI-heavy application.

Key success metrics:
- Lighthouse performance score >90
- WCAG 2.1 AA compliance
- <2s page load on 3G
- >90% test coverage for critical paths
- Zero accessibility violations

The platform is designed to scale with the Ethiopian football ecosystem, providing fans with a world-class digital experience inspired by SofaScore's proven UX patterns.
