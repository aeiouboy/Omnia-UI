# Chore: Create Style Guide Page for Frontend Developers

## Metadata
adw_id: `b8df7934`
prompt: `Create a new style guide page for frontend developers that includes:
1. New menu item in the navigation for 'Style Guide'
2. New page at /style-guide that displays:
   - All CSS components used in the system (buttons, cards, badges, alerts, etc.)
   - Typography system (fonts, sizes, weights, line heights)
   - Color palette (all Tailwind colors used in the project)
   - Spacing system (margins, padding, gaps)
   - Component examples with live previews and code snippets
   - Responsive breakpoints documentation
3. Make it mobile-friendly and interactive
4. Use existing UI components from src/components/ui/
5. Follow the same design patterns as executive dashboard`

## Chore Description
Create a comprehensive style guide page at `/style-guide` that serves as a living documentation for frontend developers. This page will showcase all UI components, typography system, color palette, spacing system, and responsive breakpoints with live interactive examples and code snippets. The page will be accessible via a new navigation menu item and follow the same enterprise design patterns used throughout the application.

## Relevant Files

### Existing Files to Reference
- **tailwind.config.ts** - Contains complete color palette, typography definitions (fonts: Inter, Poppins, JetBrains Mono), spacing system, and responsive breakpoints
- **src/components/ui/** - All 52 UI components to showcase (button.tsx, card.tsx, badge.tsx, alert.tsx, etc.)
- **src/components/side-nav.tsx** - Navigation component where new "Style Guide" menu item will be added
- **src/components/dashboard-shell.tsx** - Layout component to update bottom nav for mobile
- **app/page.tsx** - Reference for page structure and DashboardShell usage
- **components/executive-dashboard/index.tsx** - Reference for design patterns and layout structure

### New Files to Create

#### 1. **app/style-guide/page.tsx**
Main page component that renders the style guide

#### 2. **src/components/style-guide/style-guide-content.tsx**
Main content component containing all style guide sections

#### 3. **src/components/style-guide/component-showcase.tsx**
Reusable component for displaying component examples with code snippets

#### 4. **src/components/style-guide/color-swatch.tsx**
Component to display color palette with hex values

#### 5. **src/components/style-guide/typography-showcase.tsx**
Component to display typography system

#### 6. **src/components/style-guide/spacing-showcase.tsx**
Component to display spacing system examples

#### 7. **src/components/style-guide/breakpoint-showcase.tsx**
Component to display responsive breakpoints with live viewport indicators

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Navigation Menu Item
- Update `src/components/side-nav.tsx` to add "Style Guide" menu item
- Import appropriate icon from lucide-react (e.g., Palette or BookOpen)
- Add new route object to navItems array with href="/style-guide"
- Update `src/components/dashboard-shell.tsx` bottomNavItems to include Style Guide (only if needed for mobile)

### 2. Create Main Style Guide Page
- Create `app/style-guide/page.tsx`
- Import DashboardShell and StyleGuideContent components
- Follow same structure as `app/page.tsx`
- Add proper metadata and page title

### 3. Create Style Guide Content Component
- Create `src/components/style-guide/style-guide-content.tsx`
- Use Card components for section organization
- Create tabbed interface or accordion for different sections:
  - Components
  - Typography
  - Colors
  - Spacing
  - Breakpoints
- Follow executive dashboard design patterns (enterprise color palette, mobile-first layout)

### 4. Create Component Showcase Component
- Create `src/components/style-guide/component-showcase.tsx`
- Accept props: componentName, description, example (ReactNode), code (string)
- Display live preview with interactive examples
- Show code snippet with syntax highlighting (use basic pre/code tags styled appropriately)
- Include copy-to-clipboard functionality
- Make it responsive with proper spacing

### 5. Showcase All UI Components
- In StyleGuideContent, create sections for each component category:
  - **Buttons**: All variants (default, destructive, outline, secondary, ghost, link) and sizes (sm, default, lg, icon)
  - **Cards**: Card with header, title, description, content, footer
  - **Badges**: All variants (default, secondary, destructive, outline)
  - **Alerts**: All variants with icons and actions
  - **Inputs**: Text input, textarea, select, checkbox, radio, switch
  - **Dialogs & Modals**: Dialog, AlertDialog, Sheet, Drawer
  - **Navigation**: Tabs, Accordion, Breadcrumb, Pagination
  - **Data Display**: Table, Tooltip, Avatar, Skeleton
  - **Feedback**: Toast, Progress, Spinner states
- Use ComponentShowcase for each example with working code snippets

### 6. Create Typography Showcase
- Create `src/components/style-guide/typography-showcase.tsx`
- Display font families from tailwind.config.ts:
  - Inter (sans): Body text font with CSS variable support
  - Poppins (heading/display): Heading font with CSS variable support
  - JetBrains Mono (mono): Code font with CSS variable support
- Show all text sizes: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-4xl
- Show font weights: font-normal, font-medium, font-semibold, font-bold
- Show line heights with examples
- Display each with live preview and CSS class names

### 7. Create Color Palette Display
- Create `src/components/style-guide/color-swatch.tsx`
- Display all colors from tailwind.config.ts:
  - **Enterprise Colors**: enterprise-dark (#1a2233), enterprise-blue (#0f172a), enterprise-light (#f8fafc), enterprise-border (#e2e8f0), enterprise-text (#334155), enterprise-text-light (#64748b)
  - **Status Colors**: status-success (#10b981), status-warning (#f59e0b), status-critical (#ef4444), status-info (#3b82f6)
  - **Business Unit Colors**: tops-green (#10b981), central-orange (#f97316), supersports-blue (#3b82f6)
  - **Shadcn Colors**: primary, secondary, destructive, muted, accent, card, popover (with HSL values)
- Show color name, hex/HSL value, and usage description
- Make swatches clickable to copy color value

### 8. Create Spacing System Display
- Create `src/components/style-guide/spacing-showcase.tsx`
- Display Tailwind spacing scale: 0, 0.5, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64
- Show visual representation of each spacing value
- Include examples of: margin (m-*), padding (p-*), gap (gap-*)
- Display corresponding rem/px values

### 9. Create Responsive Breakpoints Display
- Create `src/components/style-guide/breakpoint-showcase.tsx`
- Display all Tailwind breakpoints:
  - Mobile: default (< 640px)
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px (custom: 1400px for container)
- Show current viewport size indicator
- Include examples of responsive utilities: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
- Reference mobile-first design approach from CLAUDE.md

### 10. Add Interactive Features
- Implement copy-to-clipboard for code snippets
- Add search/filter functionality for components
- Create smooth scroll navigation between sections
- Add "View Component Source" links to actual component files in src/components/ui/
- Ensure all interactive elements have proper touch targets (minimum 44px for mobile)

### 11. Style and Polish
- Apply enterprise color palette consistently
- Use Card components for section organization
- Add proper heading hierarchy (h1, h2, h3)
- Implement skeleton loading states
- Add hover effects and transitions
- Ensure proper spacing and visual hierarchy
- Follow mobile-first responsive design (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pattern)

### 12. Test Responsive Behavior
- Test on mobile viewport (< 640px)
- Test on tablet viewport (640px - 1024px)
- Test on desktop viewport (> 1024px)
- Verify navigation works on both desktop sidebar and mobile bottom nav
- Ensure touch interactions work properly on mobile
- Verify code snippets are scrollable on small screens

### 13. Validate Implementation
- Verify all 52 UI components are documented
- Check that all colors from tailwind.config.ts are displayed
- Confirm typography system matches font definitions
- Ensure spacing examples are accurate
- Test copy-to-clipboard functionality
- Verify navigation menu item appears in both desktop and mobile views
- Run `pnpm dev` and navigate to /style-guide to test

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and test the style guide page at http://localhost:3000/style-guide
- `pnpm build` - Ensure the build succeeds without errors
- `pnpm lint` - Run ESLint to check for code quality issues

### Manual Testing Checklist
- [ ] Navigate to /style-guide successfully loads
- [ ] "Style Guide" appears in side navigation
- [ ] "Style Guide" appears in mobile bottom navigation (if applicable)
- [ ] All component examples render correctly
- [ ] Code snippets display properly with formatting
- [ ] Copy-to-clipboard works for code snippets
- [ ] Color swatches display correct colors and values
- [ ] Typography examples show correct fonts and sizes
- [ ] Spacing examples display accurate measurements
- [ ] Breakpoint indicators show current viewport size
- [ ] Page is responsive on mobile, tablet, and desktop
- [ ] Touch interactions work on mobile devices
- [ ] Search/filter functionality works (if implemented)
- [ ] Smooth scroll navigation works between sections

## Notes

### Design Considerations
- Follow the executive dashboard design patterns as specified
- Use enterprise color palette consistently
- Maintain mobile-first responsive design approach
- Ensure minimum 44px touch targets for mobile interactions

### Component Organization
- Group related components together (e.g., all form inputs, all feedback components)
- Use tabs or accordion pattern for better content organization
- Consider adding a quick navigation menu for jumping to specific sections

### Code Snippet Handling
- Use syntax highlighting for better readability (can use basic CSS or consider lightweight libraries)
- Show both JSX/TSX code and corresponding CSS classes
- Include import statements in code examples

### Performance
- Lazy load component examples if needed
- Optimize images and assets
- Consider code splitting for large component showcase sections

### Future Enhancements (Optional)
- Add dark mode toggle to preview components in dark theme
- Include component props documentation
- Add accessibility guidelines for each component
- Create downloadable design tokens file (JSON/CSS)
- Add version history for component updates
