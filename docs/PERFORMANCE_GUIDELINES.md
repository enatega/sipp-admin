# Performance Development Guidelines

**Comprehensive performance optimization guidelines for the Enatega Admin development team.**

> **Goal:** Maintain 60-80% faster page loads and excellent user experience through performance-first development practices.
>
> **Last Updated:** April 8, 2026
>
> **Status:** ✅ Active - Based on Phase 1 & Phase 2 optimizations

---

## 📊 Table of Contents

1. [Component Architecture Principles](#1-component-architecture-principles)
2. [Lazy Loading Rules](#2-lazy-loading-rules)
3. [Loading States & UX](#3-loading-states--ux)
4. [Import & Bundle Optimization](#4-import--bundle-optimization)
5. [Component Design Patterns](#5-component-design-patterns)
6. [Data Fetching Optimization](#6-data-fetching-optimization)
7. [Image Optimization](#7-image-optimization)
8. [Code Splitting Strategies](#8-code-splitting-strategies)
9. [Performance Monitoring](#9-performance-monitoring)
10. [Before Marking a Task "Done"](#10-before-marking-a-task-done)
11. [Common Anti-Patterns](#11-common-anti-patterns)
12. [Code Review Checklist](#12-code-review-checklist)
13. [Quick Wins](#13-quick-wins)
14. [File Size Guidelines](#14-file-size-guidelines)
15. [Testing Performance](#15-testing-performance)
16. [Team Workflow](#16-team-workflow)

---

## 1. Component Architecture Principles

### ✅ DO:

- **Use Server Components by default** - Only use `'use client'` when absolutely necessary
- **Extract client-side interactive parts** into separate, smaller components
- **Lazy load components > 200 lines** with dynamic imports
- **Keep components focused** - Single responsibility principle
- **Keep components under 300 lines** when possible

### ❌ DON'T:

- Mark entire pages as `'use client'` when only a small part needs interactivity
- Import heavy components (charts, maps, tables) directly without lazy loading
- Create monolithic components that do too many things
- Use `'use client'` for components that only render static content

### Quick Check:

```typescript
// ❌ BAD - Unnecessary client component
'use client';

export function ShopTypesPage() {
  // No hooks, no event handlers, no browser APIs
  return (
    <div>
      <h1>Shop Types</h1>
      <ShopTypesTable />
    </div>
  );
}

// ✅ GOOD - Server component by default
export function ShopTypesPage() {
  return (
    <div>
      <h1>Shop Types</h1>
      <ShopTypesTable />
    </div>
  );
}
```

### When to Use `'use client'`:

✅ **Necessary when:**

- Using React hooks (`useState`, `useEffect`, `useRef`, etc.)
- Handling browser events (`onClick`, `onChange`, `onSubmit`, etc.)
- Using browser APIs (`window`, `document`, `navigator`, etc.)
- Using Formik or React Hook Form
- Implementing authentication redirects
- Using WebSocket or real-time features

❌ **NOT needed for:**

- Static rendering
- Data fetching (use server components + server actions)
- Display components
- Layout components without interactivity

---

## 2. Lazy Loading Rules

### Always Lazy Load:

**Heavy Components:**

- Chart components (recharts, chart.js, react-chartjs-2)
- Map components (@react-google-maps/api, Mapbox, Leaflet)
- Table components > 150 lines
- Rich text editors (TipTap, Quill, CKEditor)
- File uploaders (especially with drag-drop)
- Heavy form steps (> 200 lines)
- Modals and drawers
- Data visualization components

### Pattern to Follow:

```typescript
import dynamic from 'next/dynamic';
import { ShimmerTable, ShimmerMap, ShimmerChart } from '@/components/ui/shimmer';

// ✅ GOOD - Lazy load with beautiful loading state
const HeavyTable = dynamic(
  () => import('./HeavyTable'),
  {
    loading: () => <ShimmerTable rows={10} columns={6} />,
  }
);

// ✅ GOOD - Map component with SSR disabled
const GoogleMap = dynamic(
  () => import('./GoogleMap'),
  {
    loading: () => <ShimmerMap className="h-[400px] w-full" />,
    ssr: false, // Maps don't work with SSR
  }
);

// ✅ GOOD - Chart component
const RevenueChart = dynamic(
  () => import('./RevenueChart'),
  {
    loading: () => <ShimmerChart className="h-64 w-full" />,
    ssr: false,
  }
);
```

### Lazy Loading Cheat Sheet:

| Component Type | Lines | Loading Component | ssr   |
| -------------- | ----- | ----------------- | ----- |
| Tables         | > 150 | `ShimmerTable`    | true  |
| Charts         | Any   | `ShimmerChart`    | false |
| Maps           | Any   | `ShimmerMap`      | false |
| Forms          | > 200 | `ShimmerForm`     | true  |
| Cards          | Any   | `ShimmerCard`     | true  |
| Lists          | Any   | `ShimmerList`     | true  |

---

## 3. Loading States & UX

### Always Provide:

1. **Beautiful shimmer/skeleton states** - Use our Shimmer components
2. **Loading indicators** - For async operations
3. **Error boundaries** - For critical components
4. **Empty states** - With helpful messages

### Use Our Shimmer Components:

```tsx
import {
  ShimmerTable,
  ShimmerCard,
  ShimmerMap,
  ShimmerChart,
  ShimmerStatsGrid,
  ShimmerList,
  ShimmerForm
} from '@/components/ui/shimmer';

// Table loading state
<ShimmerTable rows={10} columns={6} showHeader />

// Stats cards loading
<ShimmerStatsGrid count={5} />

// Map loading
<ShimmerMap className="h-[500px] w-full" showMarker />

// Chart loading
<ShimmerChart className="h-64 w-full" showAxes />

// List loading
<ShimmerList items={5} />

// Form loading
<ShimmerForm fields={4} />
```

### Loading State Best Practices:

```typescript
// ✅ GOOD - Beautiful loading state
const OrdersTable = dynamic(
  () => import('./OrdersTable'),
  {
    loading: () => (
      <div className="space-y-4">
        <ShimmerTable rows={10} columns={8} />
      </div>
    ),
  }
);

// ❌ BAD - Boring loading state
const OrdersTable = dynamic(
  () => import('./OrdersTable'),
  {
    loading: () => <div>Loading...</div>,
  }
);

// ❌ WORSE - No loading state
const OrdersTable = dynamic(() => import('./OrdersTable'));
```

---

## 4. Import & Bundle Optimization

### Optimize Package Imports (in `next.config.ts`):

Already configured for:

```typescript
optimizePackageImports: [
  'date-fns', // ✅ DONE
  'lucide-react', // ✅ DONE
  'framer-motion', // ✅ DONE - Phase 2
  'recharts', // ✅ DONE - Phase 2
  'react-chartjs-2', // ✅ DONE - Phase 2
  '@react-google-maps/api', // ✅ DONE - Phase 2
];
```

**When adding new libraries:**

- If library > 50KB, add to `optimizePackageImports`
- Check bundle size before/after
- Monitor in build output

### Import Best Practices:

```typescript
// ❌ BAD - Import entire library
import * as Icons from 'lucide-react';
// ✅ GOOD - Import specific items
import { ChevronDown, Settings, User } from 'lucide-react';
import * as Utils from '@/lib/utils';
import { cn, formatDate } from '@/lib/utils';
// ✅ GOOD - Use barrel exports (index.ts)
import { Button } from '@/components/ui/button';
// ❌ BAD - Import from subdirectories
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input';
import { Input } from '@/components/ui/input/input';
```

### Bundle Size Monitoring:

```bash
# After significant changes, run:
npm run build

# Check output for:
# ├─ /_not-found          86 kB    87 kB
# ├─ /admin               185 kB   189 kB  ⬅️ Monitor this
# ├─ /dashboard           142 kB   145 kB  ⬅️ Monitor this

# Alert if:
# - Any page > 200 kB
# - Total bundle grows > 20%
```

---

## 5. Component Design Patterns

### Split Smartly:

```typescript
// ✅ GOOD - Server component + client parts
// app/(super-admin)/enatega-deliveries/dashboard/page.tsx

import { ClientFilters } from './ClientFilters';
import { StatsCards } from './StatsCards';
import { RecentOrdersTable } from './RecentOrdersTable';

// SERVER COMPONENT (no 'use client' needed)
export default function DashboardPage() {
  const data = await fetchDashboardData();

  return (
    <div className="space-y-6">
      {/* Static or server-rendered */}
      <DashboardHeader />
      <StatsCards data={data?.cards} />

      {/* Client component for interactivity */}
      <ClientFilters initialFilters={data?.filters} />

      {/* Can be server component */}
      <RecentOrdersTable data={data?.orders} />
    </div>
  );
}

// components/ClientFilters.tsx
'use client';

import { useState } from 'react';

export function ClientFilters({ initialFilters }) {
  const [filters, setFilters] = useState(initialFilters);
  // Interactive filter logic...
}
```

### Component Size Guidelines:

| Component Type   | Max Lines | Action                    |
| ---------------- | --------- | ------------------------- |
| Page components  | 200       | Consider splitting        |
| Table components | 300       | Extract columns/actions   |
| Form components  | 250       | Split into steps/sections |
| Chart components | 200       | Extract data logic        |
| Modal components | 150       | Extract content           |

---

## 6. Data Fetching Optimization

### Use React Query Efficiently:

```typescript
// ✅ GOOD - Properly configured
const { data, isLoading, isError } = useQuery({
  queryKey: ['orders', page, limit],
  queryFn: () => fetchOrders(page, limit),
  staleTime: 5 * 60 * 1000, // 5 minutes - Data is fresh for 5 min
  gcTime: 10 * 60 * 1000, // 10 minutes - Keep in cache for 10 min
  refetchOnWindowFocus: false, // Don't refetch on tab switch
  refetchOnMount: false, // Don't refetch if data exists
});

// ❌ BAD - No configuration (default = aggressive refetching)
const { data } = useQuery({
  queryKey: ['orders'],
  queryFn: fetchOrders,
  // Will refetch on:
  // - Every window focus
  // - Component mount
  // - Network reconnect
  // - WASTEFUL!
});
```

### Cache Strategy Guidelines:

| Data Type                  | staleTime | gcTime   | Refetch on Focus |
| -------------------------- | --------- | -------- | ---------------- |
| User profile               | 10 min    | 30 min   | No               |
| Dashboard stats            | 2 min     | 5 min    | No               |
| Real-time data             | 30s       | 1 min    | Yes              |
| Master data (zones, types) | 1 hour    | 24 hours | No               |
| Reports                    | 15 min    | 1 hour   | No               |

---

## 7. Image Optimization

### Always Use Next.js Image:

```typescript
// ✅ GOOD - Optimized image
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Company Logo"
  width={200}
  height={100}
  priority // For above-the-fold images
  placeholder="blur" // For better UX
/>

// ❌ BAD - Unoptimized image
<img src="/logo.png" alt="Logo" width={200} height={100} />
```

### Image Optimization Checklist:

- [ ] Using Next.js `Image` component
- [ ] Width and height specified
- [ ] Alt text provided
- [ ] `priority` for above-the-fold images
- [ ] `placeholder="blur"` for large images
- [ ] Proper remote patterns configured in `next.config.ts`

### Remote Images:

```typescript
// next.config.ts - Already configured
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'enatega-backend.s3.eu-north-1.amazonaws.com',
    },
    // ... more patterns
  ],
}

// Usage
<Image
  src="https://enatega-backend.s3.../image.jpg"
  alt="Product"
  width={400}
  height={300}
/>
```

---

## 8. Code Splitting Strategies

### Route-Based Splitting (Automatic):

Next.js automatically creates separate bundles for each route:

```
app/
├─ dashboard/page.tsx      → Separate chunk
├─ settings/page.tsx       → Separate chunk
├─ orders/page.tsx          → Separate chunk
```

### Component-Based Splitting (Manual):

```typescript
// ✅ GOOD - Split heavy components
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('./Chart'));
const Table = dynamic(() => import('./Table'));
const Map = dynamic(() => import('./Map'));

// Each loads only when needed
```

### Shared vs Route-Specific:

```typescript
// ✅ GOOD - Shared components in separate chunks
components/
├─ shared/
│  ├─ charts/
│  │  └─ LineChart.tsx      → Lazy loaded where used
│  ├─ tables/
│  │  └─ DataTable.tsx      → Lazy loaded where used
│  └─ ui/
│     └─ button.tsx         → Small, can be shared

// ✅ GOOD - Route-specific chunks
app/
├─ (super-admin)/
│  ├─ enatega-deliveries/
│  │  └─ dashboard/
│  │     └─ page.tsx        → Separate chunk
│  └─ general-bookings/
│     └─ dashboard/
│        └─ page.tsx        → Separate chunk
```

---

## 9. Performance Monitoring

### Development Monitoring:

```bash
# Watch build output
npm run dev

# Check Network tab in DevTools
# Look for:
# - Number of requests
# - Total transfer size
# - Load times
# - Large assets

# Use Lighthouse (Chrome DevTools)
# Target scores:
# - Performance: > 90
# - First Contentful Paint: < 1.5s
# - Largest Contentful Paint: < 2.5s
# - Total Blocking Time: < 200ms
```

### Build Analysis:

```bash
# Build with analysis
npm run build

# Check output:
✓ Compiled successfully

Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB        87 kB
├ ├ /enatega-drive/dashboard            142 kB       189 kB    ⬅️ Monitor
├ └ /enatega-deliveries/dashboard       138 kB       185 kB    ⬅️ Monitor

# Alerts:
# ⚠️  First Load JS > 200 kB → Investigate
# ⚠️  Size increased > 20% → Check what changed
```

### Performance Budgets:

Set these limits and enforce in code reviews:

| Metric                   | Budget   | Alert Threshold |
| ------------------------ | -------- | --------------- |
| First Load JS (per page) | < 150 kB | > 200 kB        |
| Total bundle size        | < 500 kB | > 600 kB        |
| Build time               | < 2 min  | > 3 min         |
| Page load time (3G)      | < 3s     | > 5s            |

---

## 10. Before Marking a Task "Done"

### Mandatory Checklist:

- [ ] **Server Component Check** - Component uses server-side rendering when possible
- [ ] **Lazy Loading Check** - Heavy components (>200 lines) are lazy loaded
- [ ] **Loading States Check** - Beautiful Shimmer components used
- [ ] **Client Directive Check** - `'use client'` is actually necessary
- [ ] **Image Check** - Images use Next.js Image component
- [ ] **Import Check** - Imports are optimized (no barrel imports from deep paths)
- [ ] **React Query Check** - Queries have proper cache settings
- [ ] **Console Check** - No errors or warnings
- [ ] **Build Check** - Page loads in < 3 seconds on 3G
- [ ] **Bundle Check** - Bundle size hasn't significantly increased

### Optional but Recommended:

- [ ] Component is < 300 lines (or split into smaller components)
- [ ] Performance tested on slow network (Chrome DevTools → Network → Slow 3G)
- [ ] Lighthouse score > 90
- [ ] No memory leaks (check with React DevTools Profiler)
- [ ] Accessibility checked (basic a11y)

---

## 11. Common Anti-Patterns

### ❌ Anti-Pattern #1: Unnecessary Client Component

```typescript
// ❌ BAD
'use client';

export function StaticPage() {
  // No hooks, no interactivity
  return <div>Hello World</div>;
}

// ✅ GOOD
export function StaticPage() {
  return <div>Hello World</div>;
}
```

### ❌ Anti-Pattern #2: Direct Heavy Imports

```typescript
// ❌ BAD - Imports 703-line component
import { InteractiveMap } from './InteractiveMap';

export function Page() {
  return <InteractiveMap />;
}

// ✅ GOOD - Lazy loaded
import dynamic from 'next/dynamic';
import { ShimmerMap } from '@/components/ui/shimmer';

const InteractiveMap = dynamic(
  () => import('./InteractiveMap'),
  {
    loading: () => <ShimmerMap className="h-[500px] w-full" />,
    ssr: false,
  }
);
```

### ❌ Anti-Pattern #3: Expensive Computations on Every Render

```typescript
// ❌ BAD
export function Component({ data }) {
  const result = expensiveCalculation(data);
  return <div>{result}</div>;
}

// ✅ GOOD
import { useMemo } from 'react';

export function Component({ data }) {
  const result = useMemo(
    () => expensiveCalculation(data),
    [data]
  );
  return <div>{result}</div>;
}
```

### ❌ Anti-Pattern #4: Function Recreated Every Render

```typescript
// ❌ BAD
export function Component() {
  const handleClick = () => {
    doSomething();
  };
  return <button onClick={handleClick}>Click</button>;
}

// ✅ GOOD
import { useCallback } from 'react';

export function Component() {
  const handleClick = useCallback(() => {
    doSomething();
  }, []);
  return <button onClick={handleClick}>Click</button>;
}
```

### ❌ Anti-Pattern #5: No Loading State

```typescript
// ❌ BAD
const Chart = dynamic(() => import('./Chart'));

// ✅ GOOD
import { ShimmerChart } from '@/components/ui/shimmer';

const Chart = dynamic(
  () => import('./Chart'),
  {
    loading: () => <ShimmerChart className="h-64 w-full" />,
  }
);
```

---

## 12. Code Review Checklist

### During PR Reviews, Always Check:

#### **Performance Checks:**

- [ ] **Lazy Loading** - Are charts/maps/tables lazy loaded?
- [ ] **Loading States** - Are Shimmer components used?
- [ ] **Server Components** - Can `'use client'` be removed?
- [ ] **Imports** - Are imports optimized?
- [ ] **Bundle Size** - Did build size increase significantly?
- [ ] **Console** - Are there errors or warnings?

#### **Code Quality Checks:**

- [ ] **Component Size** - Is component < 300 lines?
- [ ] **Complexity** - Should component be split?
- [ ] **Reusability** - Can code be reused?
- [ ] **TypeScript** - Are there any errors?
- [ ] **Naming** - Are variables/functions named clearly?

#### **UX Checks:**

- [ ] **Loading Experience** - Are loading states beautiful?
- [ ] **Error Handling** - Are errors handled gracefully?
- [ ] **Empty States** - Are there helpful empty states?
- [ ] **Feedback** - Do users get appropriate feedback?

#### **Testing Checks:**

- [ ] **Build** - Does `npm run build` pass?
- [ ] **Functionality** - Do all features work?
- [ ] **Performance** - Does page load in < 3s?

---

## 13. Quick Wins

### Implement These First (5 minutes each):

1. ✅ **Add `ssr: false`** to all map/chart dynamic imports

   ```typescript
   const Map = dynamic(() => import('./Map'), { ssr: false });
   ```

2. ✅ **Use ShimmerTable** for all table loading states

   ```typescript
   loading: () => <ShimmerTable rows={10} columns={6} />
   ```

3. ✅ **Remove `'use client'`** from pages that don't need it
   - Check for hooks, event handlers, browser APIs
   - If none, remove the directive

4. ✅ **Add `staleTime`** to React Query queries

   ```typescript
   staleTime: 5 * 60 * 1000, // 5 minutes
   ```

5. ✅ **Use optimizePackageImports** for new libraries
   - Add to `next.config.ts` if library > 50KB

### Expected Impact from Quick Wins:

- 20-30% faster page loads
- 15-20% smaller bundle
- Better user experience

---

## 14. File Size Guidelines

### Target Sizes:

| Component Type   | Target Size | Maximum Size | Action                  |
| ---------------- | ----------- | ------------ | ----------------------- |
| Page components  | < 150 lines | 200 lines    | Split if exceeded       |
| Table components | < 200 lines | 300 lines    | Extract columns/actions |
| Form components  | < 200 lines | 250 lines    | Split into steps        |
| Chart components | < 150 lines | 200 lines    | Extract data logic      |
| Modal components | < 100 lines | 150 lines    | Extract content         |
| Utility files    | < 100 lines | 150 lines    | Split by functionality  |

### When to Split Components:

**Split when:**

- Component > 300 lines
- Component does 3+ different things
- Component has deeply nested logic (> 5 levels)
- Component mixes concerns (data + UI + logic)

**How to split:**

```typescript
// ❌ BEFORE - 400 lines
export function OrderManagementPage() {
  // 400 lines of mixed logic
}

// ✅ AFTER - Split into smaller components
export function OrderManagementPage() {
  return (
    <div>
      <OrderFilters />
      <OrderStats />
      <OrderTable />
    </div>
  );
}
```

---

## 15. Testing Performance

### Before Merging to Main:

#### **1. Build Test** (Mandatory)

```bash
npm run build

# Must pass without errors
# Check output for bundle size warnings
```

#### **2. Load Time Test** (Mandatory)

```bash
# Start dev server
npm run dev

# Test in browser:
# 1. Open DevTools → Network tab
# 2. Select "Fast 3G" throttling
# 3. Navigate to your page
# 4. Check load time: Should be < 3 seconds
```

#### **3. Visual Test** (Mandatory)

- [ ] Loading states look professional
- [ ] No layout shift
- [ ] Smooth transitions
- [ ] Shimmer animations work correctly

#### **4. Functional Test** (Mandatory)

- [ ] All features work after lazy loading
- [ ] No JavaScript errors
- [ ] Data loads correctly
- [ ] User interactions work as expected

#### **5. Console Test** (Mandatory)

```bash
# Open DevTools → Console tab
# Should see: No errors, no warnings
```

#### **6. Performance Test** (Recommended)

```bash
# Run Lighthouse (Chrome DevTools → Lighthouse)
# Target scores:
# - Performance: > 90
# - Accessibility: > 90
# - Best Practices: > 90
```

---

## 16. Team Workflow

### Weekly Performance Reviews:

**Every week, dedicate 30 minutes to:**

1. **Review Bundle Size**

   ```bash
   npm run build
   # Check output for large pages
   ```

2. **Check for New Anti-Patterns**
   - Search for new `'use client'` directives
   - Look for direct imports of heavy components
   - Check for components > 300 lines

3. **Identify Optimization Opportunities**
   - Large components that could be split
   - Missing lazy loading
   - Unnecessary client components

### During Sprint Planning:

**Performance Budget for Each Task:**

- Small task (1-2 hours): +5% bundle size acceptable
- Medium task (3-5 hours): +10% bundle size acceptable
- Large task (5+ days): +15% bundle size acceptable

**If budget exceeded:**

- Document why size increased
- Plan optimization in next sprint
- Consider code splitting

### Code Review Process:

**For PRs that touch UI components:**

1. **Author must:**
   - Complete performance checklist
   - Test on slow network
   - Provide before/after metrics if optimization

2. **Reviewer must:**
   - Verify performance checklist
   - Check bundle size impact
   - Test loading states
   - Run build locally

3. **Approval criteria:**
   - No performance regressions
   - Loading states are beautiful
   - Build passes without errors
   - Bundle size within acceptable limits

### Onboarding New Developers:

**Day 1:**

- Read this document
- Review Phase 1 & Phase 2 optimization files
- Understand Shimmer component usage

**Week 1:**

- Shadow senior developer on PR reviews
- Practice using performance checklist
- Learn to identify optimization opportunities

**Month 1:**

- Independent performance reviews
- Suggest optimizations in PRs
- Contribute to performance guidelines

---

## 📋 Quick Reference Card

Print this for your team:

```
┌─────────────────────────────────────────────────────┐
│        PERFORMANCE CHECKLIST                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  BEFORE YOU MARK A TASK DONE:                      │
│                                                     │
│  □ Remove 'use client' if not needed               │
│  □ Lazy load charts/maps/tables                    │
│  □ Use Shimmer components for loading              │
│  □ Optimize package imports                         │
│  □ Use Next.js Image for images                     │
│  □ Configure React Query cache                      │
│  □ Keep components < 300 lines                     │
│  □ Test build: npm run build                        │
│  □ Test load time (< 3s on 3G)                     │
│  □ Check console (no errors/warnings)              │
│                                                     │
│  RED FLAGS:                                        │
│  ⚠️  Component > 300 lines                        │
│  ⚠️  Direct import of heavy component              │
│  ⚠️  'use client' without hooks/events              │
│  ⚠️  No loading state                              │
│  ⚠️  Bundle size +20%                              │
│                                                     │
│  GET HELP:                                         │
│  💬 Ask in #performance channel                      │
│  📚 Read OPTIMIZATION_PLAN.md                       │
│  🎯 Review PERFORMANCE_FIXES.md                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Key Metrics & Targets

### Our Current Performance (After Phase 1 & 2):

| Metric                 | Before | After | Improvement |
| ---------------------- | ------ | ----- | ----------- |
| Dashboard Page Load    | 5.0s   | 2.0s  | 60% ✅      |
| Table Page Load        | 4.5s   | 2.5s  | 44% ✅      |
| Map Page Load          | 4.0s   | 2.2s  | 45% ✅      |
| Bundle Size            | 2 .5MB | 1.8MB | 28% ✅      |
| First Contentful Paint | 3.5s   | 1.8s  | 49% ✅      |

### Maintain These Standards:

- ✅ Build time: < 2 minutes
- ✅ Page load (3G): < 3 seconds
- ✅ First Contentful Paint: < 1.5s
- ✅ Largest Contentful Paint: < 2.5s
- ✅ No console errors or warnings
- ✅ Bundle size: Monitor and alert on +20%

---

## 📚 Additional Resources

### Internal Documentation:

- [**OPTIMIZATION_PLAN.md**](./OPTIMIZATION_PLAN.md) - Complete optimization roadmap
- [**PERFORMANCE_FIXES.md**](./PERFORMANCE_FIXES.md) - Quick performance fixes
- [**API_INTEGRATION_GUIDE.md**](./API_INTEGRATION_GUIDE.md) - API best practices

### External Resources:

- [Next.js Performance Documentation](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web.dev Performance Guides](https://web.dev/performance/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

---

## 🔧 Troubleshooting

### Common Issues & Solutions:

**Issue: Build suddenly became slow**

```bash
# Solution: Clean cache
npm run clean
npm run build
```

**Issue: Page not loading components**

```bash
# Check: Are you using dynamic imports correctly?
# Named exports need .then()
const Component = dynamic(
  () => import('./Component').then(mod => ({ default: mod.Component }))
);
```

**Issue: Shimmer not showing**

```bash
# Check: Is dynamic import configured correctly?
# Need loading() callback
const Component = dynamic(
  () => import('./Component'),
  { loading: () => <Shimmer /> }
);
```

**Issue: Bundle size increased**

```bash
# Check: What changed?
npm run build
# Compare with previous build output
# Look for large new dependencies
```

---

## 📞 Getting Help

### Performance Questions:

1. **Slack Channel:** #performance
2. **Code Review:** Request performance review in PR
3. **Documentation:** Check this guide first
4. **Pair Programming:** Work with senior dev

### When to Ask for Help:

- ✅ Uncertain about lazy loading strategy
- ✅ Bundle size increased significantly
- ✅ Not sure if component should be client or server
- ✅ Need help with performance debugging
- ❌ Don't ask for help before reading this guide

---

## 🔄 Continuous Improvement

### Performance as a Culture:

- **Performance is everyone's responsibility** - Not just "optimization team"
- **Test early, test often** - Don't wait until production
- **Monitor regularly** - Weekly bundle size reviews
- **Share knowledge** - Document learnings with team
- **Celebrate wins** - Acknowledge performance improvements

### Next Steps:

1. ✅ **Week 1:** Team reads this guide
2. ✅ **Week 2:** Implement performance checklist in PRs
3. ✅ **Week 3:** First performance retrospective
4. ✅ **Week 4:** Establish performance budgets
5. ✅ **Ongoing:** Continuous monitoring and optimization

---

## 📝 Summary

### 5 Golden Rules for Performance:

1. **Server First** - Use server components unless client-side is absolutely necessary
2. **Lazy Load Heavy Things** - Charts, maps, tables > 200 lines
3. **Beautiful Loading** - Always use Shimmer components, never just "Loading..."
4. **Optimize Imports** - Use optimizePackageImports, import specific items
5. **Monitor Bundle** - Check build output after significant changes

### Success Criteria:

- ✅ All team members follow performance guidelines
- ✅ No performance regressions in PRs
- ✅ Bundle size monitored weekly
- ✅ Loading states are beautiful everywhere
- ✅ Page load times remain under 3 seconds

---

**Remember:** Performance is not an afterthought—it's a feature. Fast loading = Happy Users = Better Business. 🚀

---

_Last Updated: April 8, 2026_
_Maintained by: Development Team_
_Version: 1.0_
