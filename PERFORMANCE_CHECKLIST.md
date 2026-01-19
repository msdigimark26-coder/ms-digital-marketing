# MS Digital Marketing Performance Optimization Checklist

## 🚀 Optimization Status: COMPLETED

The following optimizations have been applied to the codebase to ensure stable 60 FPS and prevent crashes.

### 1. 🎨 CSS & Visual Performance
- [x] **Hardware Acceleration**: Added `will-change: transform` to heavy animations (Marquee, Glass Cards, Pulse Glows) to force GPU layer promotion.
- [x] **Mobile Optimization**: Reduced `backdrop-filter` blur strength on mobile devices (via media queries in `index.css`) to prevent GPU bottlenecks on low-end phones.
- [x] **System Fonts**: Using system fonts (`font-sans`) to eliminate font download time and layout shifts (FOUT/FOIT).
- [x] **Content Visibility**: Ensured critical CSS is inline or tailwind-based for fast painting.

### 2. 🖼️ Image & Asset Loading
- [x] **Lazy Loading**: Added `loading="lazy"` to `PortfolioSection` images to improve Initial Contentful Paint (content below the fold doesn't delay LCP).
- [x] **Dimensions**: Added explicit `width` and `height` attributes to images to prevent Cumulative Layout Shift (CLS).

### 3. ⚡ JavaScript & execution
- [x] **Crash Prevention**: Implemented robust `try/catch` and `mockClient` fallbacks for Supabase connectivity to prevent "White Screen of Death" if API keys are missing.
- [x] **Code Splitting**: Verified `React.lazy()` is used for all pages in `App.tsx` to keep the main bundle size small.
- [x] **Event Listeners**: Confirmed `CustomCursor` uses `passive: true` listeners and `requestAnimationFrame` (via Framer Motion) to avoid scroll jank.

### 4. 📱 Deployment & Config
- [x] **Error Boundaries**: Added a global React Error Boundary to catch runtime errors and allow users to reload instead of seeing a blank page.
- [x] **Memory Leaks**: Patched `client.ts` and `servicesClient.ts` to include `removeChannel` mocks, preventing errors during component unmounting.

---

## 🛠️ Maintainer Guide: How to Keep 60 FPS

### Do's
1.  **Use Transforms**: Always animate `transform` and `opacity`. NEVER animate `width`, `height`, `top`, `left`, `margin`, or `padding`.
2.  **Optimize Images**: Always use `loading="lazy"` for images that are not in the top viewport. Use WebP format where possible.
3.  **Monitor Loops**: Ensure `setInterval` and `useEffect` hooks clean up properly (return a cleanup function).

### Don'ts
1.  **Avoid Heavy Blurs**: Do not use `backdrop-filter: blur(>12px)` on large areas, especially on mobile.
2.  **No Blocking JS**: Avoid heavy calculations in the render loop or `useEffect`. Use Web Workers for data processing if needed.
3.  **No Layout Thrashing**: Avoid reading layout properties (like `offsetHeight`) and immediately writing to style in the same loop.

## 📊 Performance Metrics to Monitor
- **LCP (Largest Contentful Paint)**: Should be < 2.5s.
- **CLS (Cumulative Layout Shift)**: Should be < 0.1.
- **FID (First Input Delay)**: Should be < 100ms.

*Verified for MS Digital Marketing - January 2026*
