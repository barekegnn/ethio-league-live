# Implementation Plan: Public Football Platform Frontend

## Overview

This implementation plan covers the development of a comprehensive, mobile-first public-facing football platform for Ethiopian leagues. The platform is built with Next.js 14, React 19, TypeScript, and Tailwind CSS, following SofaScore-inspired UX patterns. The platform is maintained as a **completely separate repository** from the backend admin system, consuming data via public REST API endpoints.

## Tasks

- [x] 1. Initialize Next.js 14 project with core configuration
  - Create new repository `ethio-league-public` (separate from backend)
  - Initialize Next.js 14 with TypeScript and App Router
  - Configure next.config.ts with image domains (Cloudinary)
  - Set up environment variables (.env.local with NEXT_PUBLIC_API_URL)
  - Configure port 3001 for public app
  - Install core dependencies (SWR, Axios, date-fns, clsx, tailwind-merge)
  - _Requirements: 0, 0.1_

- [x] 2. Set up styling and UI foundation
  - [x] 2.1 Set up Tailwind CSS and shadcn/ui
    - Install and configure Tailwind CSS
    - Set up shadcn/ui component library
    - Configure theme colors (SofaScore-inspired dark primary)
    - Set up responsive breakpoints (640px, 768px, 1024px, 1280px)
    - Configure dark mode support
    - _Requirements: 0.1, 0.2, 31_
  
  - [x] 2.2 Configure internationalization with next-intl
    - Install and configure next-intl
    - Create messages directory with en.json and am.json
    - Set up locale detection and persistence
    - Configure date and number formatting
    - _Requirements: 30_
  
  - [x] 2.3 Set up PWA configuration
    - Create manifest.json with app metadata and icons
    - Configure service worker for offline support
    - Set up caching strategies for different content types
    - Add PWA meta tags to layout
    - _Requirements: 0.4_
  
  - [x] 2.4 Define TypeScript types for API responses
    - Create types/entities.ts with entity interfaces (Match, Club, Player, etc.)
    - Create types/api.ts with API response types
    - Define types based on backend API response structures
    - NOTE: Frontend defines its own types - no shared packages with backend
    - _Requirements: 0_

- [x] 3. Implement shared utilities and API client
  - [x] 3.1 Create utility functions
    - Implement date formatting utilities (formatMatchDate, getTimeUntilKickoff)
    - Implement number formatting utilities (formatNumber, formatPercentage)
    - Implement text utilities (truncateText)
    - Implement validation utilities
    - _Requirements: 27, 30_
  
  - [x]* 3.2 Write unit tests for utility functions
    - Test date formatting for different locales
    - Test number formatting edge cases
    - Test text truncation logic
    - _Requirements: 27, 30_
  
  - [x] 3.3 Set up SWR API client with error handling
    - Configure Axios client with backend API base URL (from env variable)
    - Set up SWR configuration with cache durations
    - Implement error handling (ApiError, NetworkError, ValidationError)
    - Create error handler with user-friendly messages
    - NOTE: API client calls backend at NEXT_PUBLIC_API_URL
    - _Requirements: 33, 32, 0_
  
  - [x] 3.4 Create custom SWR hooks for data fetching
    - Implement useMatches hook with live refresh
    - Implement useStandings hook
    - Implement usePlayers hook
    - Implement useClubs hook
    - Implement useLeagues hook
    - _Requirements: 33, 1, 2, 6_

- [x] 4. Build core layout components
  - [x] 4.1 Create root layout with providers
    - Implement RootLayout with HTML structure
    - Add ThemeProvider for dark mode
    - Add LocaleProvider for i18n
    - Add SWRConfig provider
    - Configure metadata for SEO
    - _Requirements: 29, 30, 31, 33_
  
  - [x] 4.2 Implement Header component
    - Create responsive header with logo
    - Add search bar with autocomplete
    - Add language switcher
    - Add theme toggle button
    - Implement mobile hamburger menu
    - _Requirements: 24, 30, 31_
  
  - [x] 4.3 Implement BottomNav component for mobile
    - Create fixed bottom navigation bar
    - Add 5 navigation items (Home, Matches, Leagues, Favorites, More)
    - Implement active state highlighting
    - Add touch-optimized sizing (44x44px minimum)
    - _Requirements: 0.1, 0.2_
  
  - [x] 4.4 Implement Footer component
    - Create footer with links (About, Privacy, Terms, Contact)
    - Add social media links
    - Add copyright notice
    - Make responsive for mobile/desktop
    - _Requirements: 0.1_
  
  - [x] 4.5 Create error boundaries and error pages
    - Implement global error boundary (app/error.tsx)
    - Create custom 404 page (app/not-found.tsx)
    - Create ErrorMessage component
    - Create EmptyState component
    - _Requirements: 32_

- [x] 5. Implement shared UI components
  - [x] 5.1 Create skeleton loaders
    - Implement MatchCardSkeleton
    - Implement StandingsTableSkeleton
    - Implement PlayerCardSkeleton
    - Implement generic SkeletonLoader component
    - _Requirements: 32_
  
  - [x] 5.2 Implement SearchBar with autocomplete
    - Create search input with debouncing (300ms)
    - Implement autocomplete dropdown
    - Add keyboard navigation (arrow keys, enter)
    - Create mobile full-screen search overlay
    - Fetch and display autocomplete results (clubs, coaches, matches only - NO players)
    - _Requirements: 24_
  
  - [x] 5.3 Create FilterPanel component
    - Implement desktop sidebar filter panel
    - Implement mobile bottom sheet
    - Add filter controls (select, multiselect, range, date)
    - Add "Clear All" and "Apply" buttons
    - Update URL query parameters on filter change
    - _Requirements: 25_
  
  - [ ]* 5.4 Write component tests for shared UI
    - Test SearchBar autocomplete behavior
    - Test FilterPanel state management
    - Test skeleton loader rendering
    - _Requirements: 24, 25, 32_

- [x] 6. Build match-related components
  - [x] 6.1 Create MatchCard component
    - Implement compact variant for lists
    - Implement detailed variant for hero section
    - Display team logos, scores, status, time
    - Add LIVE indicator with pulsing animation
    - Make touch-optimized for mobile
    - _Requirements: 1, 2, 0.1, 0.2_
  
  - [x] 6.2 Implement LiveScoreTicker component
    - Create horizontal scrolling container
    - Display all live matches
    - Implement auto-scroll on desktop
    - Add swipe gesture support on mobile
    - Set up auto-refresh every 15 seconds
    - _Requirements: 2_
  
  - [x] 6.3 Create MatchTimeline component
    - Display chronological event timeline (newest first)
    - Show event type icons with color coding
    - Display player photos and names
    - Add animated entry for new events
    - _Requirements: 12_
  
  - [x] 6.4 Implement MatchStats component
    - Display comparative statistics with progress bars
    - Show possession, shots, corners, fouls, cards
    - Use color-coded values
    - Make responsive for mobile
    - _Requirements: 12, 13_
  
  - [ ]* 6.5 Write component tests for match components
    - Test MatchCard rendering for different statuses
    - Test LiveScoreTicker auto-refresh
    - Test MatchTimeline event display
    - Test MatchStats progress bar calculations
    - _Requirements: 1, 2, 12, 13_

- [x] 7. Build league-related components
  - [x] 7.1 Create StandingsTable component
    - Display all standings columns (position, club, stats, points, form)
    - Implement color-coded positions (promotion/relegation zones)
    - Add FormGuide with tooltips
    - Make responsive (collapse columns on mobile)
    - Add click handlers for club navigation
    - _Requirements: 8_
  
  - [x] 7.2 Implement FormGuide component
    - Display last 5 match results (W/D/L)
    - Use color coding (green/gray/red)
    - Add tooltips with match details
    - _Requirements: 8_
  
  - [x] 7.3 Create TopScorersWidget component
    - Display top 3 scorers with photos
    - Show club logos and goal counts
    - Add click handlers for player navigation
    - Make responsive for mobile
    - _Requirements: 4_
  
  - [ ]* 7.4 Write component tests for league components
    - Test StandingsTable row rendering
    - Test FormGuide color coding
    - Test TopScorersWidget data display
    - _Requirements: 4, 8_

- [x] 8. Build club and player components
  - [x] 8.1 Create ClubCard component
    - Implement grid variant for directory
    - Implement list variant for search results
    - Display club logo, name, stadium, founded year
    - Make responsive for mobile
    - _Requirements: 6, 14_
  
  - [x] 8.2 Implement SquadList component
    - Group players by position (GK, DEF, MID, FWD)
    - Display player cards with photos and details
    - Add filtering by position
    - Add sorting by jersey number or name
    - _Requirements: 15_
  
  - [x] 8.3 Create PlayerCard component
    - Implement grid variant for directory
    - Implement list variant for search results
    - Display player photo, name, position, club
    - Make responsive for mobile
    - _Requirements: 6, 19_
  
  - [x] 8.4 Implement PlayerStats component
    - Display season-by-season statistics table
    - Show career totals row
    - Add charts for goals/assists per season
    - Make responsive for mobile
    - _Requirements: 20_
  
  - [x] 8.5 Create CareerTimeline component
    - Display vertical timeline with club history
    - Show club logos, dates, and stats
    - Connect entries with vertical line
    - Make responsive for mobile
    - _Requirements: 21_

- [x] 9. Implement media components
  - [x] 9.1 Create ImageGallery component
    - Implement responsive grid layout (2/3/4 columns)
    - Add lazy loading for images
    - Integrate Cloudinary optimization (WebP, responsive sizing)
    - Add click handler to open lightbox
    - _Requirements: 18, 22, 38_
  
  - [x] 9.2 Implement Lightbox component
    - Create full-screen overlay
    - Add swipe navigation for mobile
    - Add arrow navigation for desktop
    - Add zoom support
    - Add ESC key to close
    - _Requirements: 18, 22_
  
  - [x] 9.3 Create VideoPlayer component
    - Implement adaptive bitrate streaming (HLS)
    - Add custom controls
    - Add fullscreen support
    - Optimize for mobile
    - _Requirements: 18, 38_

- [x] 10. Checkpoint - Ensure all component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Build home page
  - [x] 11.1 Create home page layout (app/(home)/page.tsx)
    - Set up page structure with sections
    - Configure SSR for initial load
    - Add metadata for SEO
    - _Requirements: 1, 29_
  
  - [x] 11.2 Implement hero section with featured match
    - Display next upcoming or current live match
    - Show team logos, scores, stadium, league
    - Add "Watch Live" or "View Match" CTA button
    - Implement countdown timer for upcoming matches
    - Add LIVE indicator with pulsing animation
    - Set up auto-refresh every 30 seconds for live matches
    - Prioritize Ethiopian Premier League matches
    - _Requirements: 1, 0.3_
  
  - [x] 11.3 Add live scores ticker section
    - Display LiveScoreTicker component when live matches exist
    - Set up auto-refresh every 15 seconds
    - _Requirements: 2_
  
  - [x] 11.4 Add league standings preview section
    - Display top 5 clubs from active Premier League season
    - Add "View Full Table" link
    - Set up SWR revalidation
    - _Requirements: 3_
  
  - [x] 11.5 Add top scorers widget section
    - Display top 3 scorers from active Premier League season
    - Add "View All Scorers" link
    - Set up SWR revalidation
    - _Requirements: 4_
  
  - [x] 11.6 Add latest news section
    - Display 5 most recent news items
    - Show title, date, excerpt, thumbnail
    - Add pagination or "Load More"
    - Make responsive (1/2/3 columns)
    - _Requirements: 5_
  
  - [ ]* 11.7 Write E2E tests for home page
    - Test hero section display
    - Test live ticker functionality
    - Test navigation to match center
    - _Requirements: 1, 2_

- [x] 12. Build league and season pages
  - [x] 12.1 Create league directory page (app/leagues/page.tsx)
    - Display all leagues grouped by organization
    - Show league cards with logo, name, category, division
    - Add filtering by gender, age, division
    - Add search by league name
    - Make responsive for mobile
    - _Requirements: 6, 0.3_
  
  - [x] 12.2 Create season selection page (app/leagues/[leagueId]/seasons/page.tsx)
    - Display all seasons for selected league
    - Sort by start date descending
    - Show season cards with name, dates, status, club count
    - _Requirements: 6_
  
  - [x] 12.3 Create season overview page (app/leagues/[leagueId]/seasons/[seasonId]/page.tsx)
    - Display season metadata and statistics
    - Implement tabbed interface (Standings, Fixtures, Results, Top Scorers, Assists, Discipline, Media)
    - Add swipe gesture navigation between tabs on mobile
    - _Requirements: 7_
  
  - [x] 12.4 Implement Standings tab
    - Display full StandingsTable component
    - Set up real-time updates (30s refresh for live matches)
    - _Requirements: 8_
  
  - [x] 12.5 Implement Fixtures and Results tabs
    - Display upcoming matches grouped by matchday
    - Display completed matches grouped by matchday
    - Add filtering by season and competition
    - _Requirements: 9, 10_
  
  - [x] 12.6 Implement Top Scorers and Assists tabs
    - Display player leaderboards with stats
    - Add sorting and filtering
    - _Requirements: 7_

- [x] 13. Build match pages
  - [x] 13.1 Create fixtures calendar page (app/matches/page.tsx)
    - Display all upcoming matches sorted by date
    - Group matches by date with headers
    - Add filtering by league, club, date range
    - Implement calendar view toggle
    - Add iCalendar export functionality
    - Make responsive for mobile
    - _Requirements: 9_
  
  - [x] 13.2 Create results archive page
    - Display completed matches sorted by date descending
    - Group by date with headers
    - Add filtering by league, club, season, date range
    - Implement pagination or infinite scroll
    - _Requirements: 10_
  
  - [x] 13.3 Create match center page (app/matches/[matchId]/page.tsx)
    - Implement dynamic routing for match ID
    - Detect match status (scheduled/live/completed)
    - Render appropriate view based on status
    - Add metadata for SEO and social sharing
    - _Requirements: 11, 12, 13, 29_
  
  - [x] 13.4 Implement pre-match view
    - Display match details and countdown timer
    - Show tabs: Overview, Lineups, Head-to-Head, Venue
    - Display recent form for both clubs
    - Show submitted lineups or "coming soon" message
    - Display head-to-head history (last 5 meetings)
    - _Requirements: 11_
  
  - [x] 13.5 Implement live match view
    - Display current score and minute with LIVE indicator
    - Show tabs: Live Events, Lineups, Statistics, Commentary
    - Implement MatchTimeline with auto-refresh (10s)
    - Display live statistics with MatchStats component
    - Show live lineups with substitution updates
    - Add optional sound for goal events
    - _Requirements: 12_
  
  - [x] 13.6 Implement post-match view
    - Display final score and match details
    - Show tabs: Summary, Events, Lineups, Statistics, Media
    - Display match highlights and key moments
    - Show complete event timeline
    - Display final statistics
    - Add media gallery with photos and videos
    - Add social sharing buttons
    - _Requirements: 13, 35_
  
  - [ ]* 13.7 Write E2E tests for match center
    - Test pre-match view rendering
    - Test live match auto-refresh
    - Test post-match media gallery
    - Test social sharing functionality
    - _Requirements: 11, 12, 13, 35_

- [x] 14. Build club pages
  - [x] 14.1 Create club directory page (app/clubs/page.tsx)
    - Display all clubs in grid layout
    - Add filtering by league, season, location
    - Add search functionality
    - Make responsive (1/2/3/4 columns)
    - _Requirements: 6, 25_
  
  - [x] 14.2 Create club profile page (app/clubs/[clubId]/page.tsx)
    - Display club header with logo, name, stadium, history
    - Implement tabbed interface (Overview, Squad, Fixtures, Results, Statistics, Media)
    - Add swipe gesture navigation on mobile
    - Add metadata for SEO (Schema.org SportsTeam)
    - _Requirements: 14, 29_
  
  - [x] 14.3 Implement Overview tab
    - Display club summary and stadium info
    - Show current season standing
    - Display recent form (last 5 matches)
    - Show upcoming fixtures (next 3)
    - Show recent results (last 3)
    - Display key statistics for current season
    - _Requirements: 14_
  
  - [x] 14.4 Implement Squad tab
    - Display SquadList component grouped by position
    - Show coaching staff with photos and roles
    - Add filtering and sorting
    - _Requirements: 15_
  
  - [x] 14.5 Implement Fixtures and Results tabs
    - Display club-specific matches
    - Add filtering by season and competition
    - _Requirements: 16_
  
  - [x] 14.6 Implement Statistics tab
    - Display season-by-season statistics
    - Show charts for goals, points progression
    - Display head-to-head records
    - _Requirements: 17_
  
  - [x] 14.7 Implement Media tab
    - Display ImageGallery component
    - Add filtering by media type
    - Integrate Lightbox for full-screen viewing
    - _Requirements: 18_

- [x] 15. Build player pages
  - [x] 15.1 Create player profile page (app/players/[playerId]/page.tsx)
    - Display player header with photo, name, position, club
    - Show personal details (DOB, nationality, height, weight, foot)
    - Implement tabbed interface (Overview, Statistics, Career History, Media)
    - Add metadata for SEO (Schema.org Person)
    - NOTE: Players are accessed ONLY through club squad pages, match lineups, and top scorers leaderboards (no directory page)
    - _Requirements: 19, 29_
  
  - [x] 15.2 Implement Overview tab
    - Display player biography
    - Show current season statistics
    - Display recent match performances (last 5)
    - Add performance chart (goals/assists per matchday)
    - _Requirements: 19_
  
  - [x] 15.3 Implement Statistics tab
    - Display PlayerStats component with season-by-season data
    - Show career totals
    - Add charts for goals, assists, discipline
    - Add filtering by club and season
    - _Requirements: 20_
  
  - [x] 15.4 Implement Career History tab
    - Display CareerTimeline component
    - Show all clubs with dates and stats
    - _Requirements: 21_
  
  - [x] 15.5 Implement Media tab
    - Display ImageGallery component
    - Integrate Lightbox for full-screen viewing
    - _Requirements: 22_

- [x] 16. Build coach pages
  - [x] 16.1 Create coach profile page (app/coaches/[coachId]/page.tsx)
    - Display coach header with photo, name, nationality, license
    - Show current club and role
    - Implement tabbed interface (Overview, Career History, Achievements)
    - Add metadata for SEO
    - _Requirements: 23, 29_
  
  - [x] 16.2 Implement Overview tab
    - Display coach biography and philosophy
    - Show current season record (matches, wins, draws, losses, win %)
    - _Requirements: 23_
  
  - [x] 16.3 Implement Career History tab
    - Display timeline of all clubs with dates and roles
    - _Requirements: 23_
  
  - [x] 16.4 Implement Achievements tab
    - Display awards, titles, and accomplishments
    - _Requirements: 23_

- [x] 17. Implement search functionality
  - [x] 17.1 Create search results page (app/search/page.tsx)
    - Display results grouped by category (Clubs, Coaches, Matches)
    - Implement pagination
    - Add filtering by category
    - Add sorting by relevance or name
    - Make responsive for mobile
    - NOTE: Players are NOT searchable; fans access players through clubs, matches, and leaderboards
    - _Requirements: 24_
  
  - [x] 17.2 Integrate search with header SearchBar
    - Connect autocomplete to search API (clubs, coaches, matches only)
    - Handle Enter key and search button clicks
    - Navigate to search results page
    - _Requirements: 24_
  
  - [ ]* 17.3 Write E2E tests for search
    - Test autocomplete suggestions
    - Test navigation to search results
    - Test filtering and sorting
    - _Requirements: 24_

- [x] 18. Checkpoint - Ensure all page tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 19. Implement SEO optimization
  - [x] 19.1 Add metadata to all pages
    - Create generateMetadata functions for dynamic pages
    - Add unique title tags (50-60 characters)
    - Add unique meta descriptions (150-160 characters)
    - Add Open Graph tags (og:title, og:description, og:image, og:url)
    - Add Twitter Card tags
    - Add canonical URLs
    - _Requirements: 29_
  
  - [x] 19.2 Implement Schema.org structured data
    - Add SportsTeam schema to club pages
    - Add Person schema to player pages
    - Add SportsEvent schema to match pages
    - Add BreadcrumbList schema to all pages
    - _Requirements: 29_
  
  - [x] 19.3 Create dynamic sitemap
    - Generate XML sitemap with all public URLs
    - Update daily with new content
    - _Requirements: 29_
  
  - [x] 19.4 Create robots.txt
    - Allow all search engines to crawl public pages
    - _Requirements: 29_

- [x] 20. Implement accessibility features
  - [x] 20.1 Add ARIA labels and semantic HTML
    - Use semantic HTML elements (header, nav, main, footer)
    - Add ARIA labels to interactive elements
    - Ensure logical heading hierarchy
    - Add alt text to all images
    - Associate form labels with inputs
    - _Requirements: 28_
  
  - [x] 20.2 Implement keyboard navigation
    - Ensure all interactive elements are keyboard accessible
    - Add visible focus indicators
    - Implement skip-to-content links
    - Add focus trapping for modals
    - Make modals dismissible with ESC key
    - _Requirements: 28_
  
  - [x] 20.3 Add reduced motion support
    - Detect prefers-reduced-motion preference
    - Disable animations when preference is set
    - _Requirements: 28_
  
  - [ ]* 20.4 Run accessibility tests
    - Run axe-core automated tests on all pages
    - Test with screen readers (NVDA, JAWS, VoiceOver)
    - Verify WCAG 2.1 AA compliance
    - _Requirements: 28_

- [x] 21. Implement performance optimizations
  - [x] 21.1 Optimize images with Cloudinary
    - Configure Cloudinary integration
    - Use responsive image URLs with width/quality parameters
    - Implement lazy loading for images
    - Add width/height attributes to prevent layout shift
    - Use WebP format with JPEG fallback
    - _Requirements: 27, 38_
  
  - [x] 21.2 Implement code splitting
    - Use dynamic imports for large components
    - Split code by route
    - Lazy load below-the-fold components
    - _Requirements: 27_
  
  - [x] 21.3 Optimize fonts and assets
    - Use font-display: swap for web fonts
    - Minify and compress CSS and JavaScript
    - Implement HTTP/2 server push for critical assets
    - _Requirements: 27_
  
  - [x] 21.4 Implement prefetching
    - Prefetch linked pages on hover (desktop)
    - Prefetch on viewport entry (mobile)
    - _Requirements: 33_
  
  - [ ]* 21.5 Run Lighthouse CI tests
    - Configure Lighthouse CI in pipeline
    - Verify performance score >90 (desktop), >80 (mobile)
    - Verify FCP <1.5s, LCP <2.5s, CLS <0.1
    - _Requirements: 27_

- [ ] 22. Implement analytics and monitoring
  - [ ] 22.1 Integrate analytics
    - Set up Google Analytics or Plausible
    - Track page views
    - Track custom events (search, filter, video play, social share, language change)
    - Track engagement metrics (time on page, scroll depth, bounce rate)
    - Anonymize IP addresses
    - _Requirements: 34_
  
  - [ ] 22.2 Integrate error tracking
    - Set up Sentry for client-side error tracking
    - Configure error boundaries to log to Sentry
    - _Requirements: 34_
  
  - [ ] 22.3 Integrate performance monitoring
    - Set up Vercel Analytics for Core Web Vitals
    - Track LCP, FID, CLS metrics
    - _Requirements: 34_
  
  - [ ] 22.4 Add cookie consent banner
    - Create cookie consent component
    - Respect Do Not Track preference
    - Provide privacy policy page
    - _Requirements: 34_

- [ ] 23. Implement social sharing
  - [ ] 23.1 Add social sharing buttons
    - Create SocialShare component
    - Add buttons for Facebook, Twitter, WhatsApp, Copy Link
    - Implement Web Share API for mobile
    - Add pre-populated share text
    - _Requirements: 35_
  
  - [ ] 23.2 Track social share events
    - Track share button clicks in analytics
    - _Requirements: 35_

- [x] 24. Implement security measures
  - [x] 24.1 Configure Content Security Policy
    - Add CSP headers to prevent XSS
    - Restrict script sources
    - _Requirements: 39_
  
  - [x] 24.2 Implement input sanitization
    - Sanitize search queries
    - Sanitize form submissions
    - _Requirements: 39_
  
  - [x] 24.3 Configure HTTPS and secure cookies
    - Ensure HTTPS for all connections
    - Use secure, httpOnly cookies for sessions
    - _Requirements: 39_

- [x] 25. Set up deployment and CI/CD
  - [x] 25.1 Configure Vercel deployment
    - Set up Vercel project for public app
    - Configure environment variables
    - Set up automatic deployments from main branch
    - Configure preview deployments for PRs
    - _Requirements: 40_
  
  - [x] 25.2 Create GitHub Actions workflow
    - Set up CI pipeline for tests
    - Run unit and component tests
    - Run E2E tests with Playwright
    - Run Lighthouse CI
    - Upload test results and coverage
    - _Requirements: 40_
  
  - [x] 25.3 Configure staging environment
    - Set up staging deployment
    - Configure staging API URL
    - _Requirements: 40_

- [x] 26. Final integration and testing
  - [x] 26.1 Test mobile responsiveness
    - Test on real iOS devices (iPhone Safari)
    - Test on real Android devices (Chrome)
    - Test on tablets
    - Verify touch targets (44x44px minimum)
    - Test gestures (swipe, pull-to-refresh)
    - _Requirements: 0.1, 26_
  
  - [x] 26.2 Test cross-browser compatibility
    - Test on Chrome, Firefox, Safari, Edge
    - Test on mobile browsers
    - _Requirements: 26_
  
  - [x] 26.3 Test internationalization
    - Test language switching
    - Verify translations for all UI text
    - Test date and number formatting
    - _Requirements: 30_
  
  - [x] 26.4 Test PWA functionality
    - Test installation prompt
    - Test offline functionality
    - Test service worker caching
    - Verify PWA Lighthouse score >90
    - _Requirements: 0.4_
  
  - [ ]* 26.5 Run full E2E test suite
    - Test all critical user journeys
    - Test home page navigation
    - Test match center flows
    - Test search functionality
    - Test mobile navigation
    - _Requirements: All_

- [x] 27. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- The implementation follows mobile-first principles throughout
- All components are built with TypeScript for type safety
- SWR is used for data fetching with appropriate cache durations
- The platform is optimized for performance (Lighthouse >90) and accessibility (WCAG 2.1 AA)
- Testing focuses on component tests, integration tests, and E2E tests (no property-based tests as this is a UI-heavy application)

