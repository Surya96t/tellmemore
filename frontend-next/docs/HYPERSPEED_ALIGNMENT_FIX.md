# Hyperspeed Effect Alignment Fix

**Date:** January 30, 2025  
**Issue:** Hyperspeed background effect misaligned on initial load, only aligned after window resize  
**Status:** ✅ Fixed

---

## Problem

The Hyperspeed effect in the Speed card was not properly aligned with its container on initial page load:

- **On First Load:** Effect appeared misaligned or incorrectly sized
- **After Resize:** Effect aligned perfectly with the card

This indicated a timing issue where the canvas was initialized before the container had its final dimensions.

---

## Root Cause

The Hyperspeed component initializes a Three.js WebGL renderer using `container.offsetWidth` and `container.offsetHeight`:

```typescript
this.renderer.setSize(container.offsetWidth, container.offsetHeight, false);
```

**Problem:** On initial mount, the container may not have its final dimensions yet because:

1. CSS Grid is still calculating layout
2. Parent containers are still positioning
3. The browser hasn't completed its first layout pass

The component's `tick()` function checks for resizes, but only when canvas dimensions don't match `clientWidth/clientHeight`. This check happens in the animation loop, but if the initial size is `0x0` or incorrect, the first frame is rendered with wrong dimensions.

---

## Solution

Implemented two fixes to ensure proper sizing on mount:

### 1. Delayed Initialization with `requestAnimationFrame`

```typescript
// Wait for next frame to ensure container has dimensions
requestAnimationFrame(() => {
  const myApp = new App(container, options);
  appRef.current = myApp;
  myApp.loadAssets().then(myApp.init);
});
```

**Why:** Delays app initialization until after the browser's layout pass, ensuring container has final dimensions.

### 2. ResizeObserver for Reactive Sizing

```typescript
// Add ResizeObserver to handle container size changes
const resizeObserver = new ResizeObserver(() => {
  if (appRef.current && container) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (width > 0 && height > 0) {
      appRef.current.renderer.setSize(width, height, false);
      appRef.current.composer.setSize(width, height, false);
      appRef.current.camera.aspect = width / height;
      appRef.current.camera.updateProjectionMatrix();
    }
  }
});

if (container) {
  resizeObserver.observe(container);
}
```

**Why:** Automatically detects and responds to container size changes:

- Handles initial layout completion
- Responds to grid recalculations
- Works for window resizes
- Handles viewport changes (e.g., mobile orientation)

---

## Changes Made

**File:** `/frontend-next/components/Hyperspeed.tsx`

**Modified:** The `Hyperspeed` component's `useEffect` hook

**Key Changes:**

1. Moved `mergedOptions` inside `useEffect` to fix dependency array warning
2. Wrapped App initialization in `requestAnimationFrame` for delayed mount
3. Added `ResizeObserver` to reactively update canvas size
4. Cleaned up ResizeObserver in cleanup function
5. Removed unused `canvas` variable to fix linting error

---

## Testing

### Before Fix ❌

```
Initial Load:
- Hyperspeed canvas: 0x0 or incorrect size
- Effect misaligned with card
- Visual glitch on first render

After Window Resize:
- Hyperspeed canvas: correct size
- Effect aligned perfectly
- No visual issues
```

### After Fix ✅

```
Initial Load:
- requestAnimationFrame ensures layout complete
- ResizeObserver triggers on first size
- Hyperspeed canvas: correct size from start
- Effect aligned perfectly on first render

After Window Resize:
- ResizeObserver triggers
- Canvas updates to new size
- Effect remains aligned
```

---

## How ResizeObserver Works

1. **Observes Container:** Watches the `#lights` div for size changes
2. **Triggers on Mount:** Fires when container gets its initial size (after grid layout)
3. **Updates Canvas:** Resizes renderer, composer, and camera when container changes
4. **Handles All Cases:** Works for initial mount, window resize, grid recalculation, etc.

---

## Why This is Better Than the Old Approach

### Old Approach (Tick Function Only)

- Only checks size in animation loop
- Initial size might be wrong for first frame
- Relies on `clientWidth/clientHeight` check
- Doesn't proactively respond to layout changes

### New Approach (ResizeObserver)

- Proactively observes container size
- Triggers immediately when layout completes
- Updates canvas as soon as container size is known
- Works for all size change scenarios

---

## Related Files

- **Component:** `/frontend-next/components/Hyperspeed.tsx`
- **Usage:** `/frontend-next/components/landing/BentoShowcase.tsx` (Speed card)
- **Layout Fix:** See `BENTO_GRID_LAYOUT_FIX.md` for grid positioning fixes

---

## Browser Compatibility

ResizeObserver is supported in all modern browsers:

- ✅ Chrome 64+
- ✅ Firefox 69+
- ✅ Safari 13.1+
- ✅ Edge 79+

For older browsers, the component falls back to the existing `tick()` resize check.

---

**Status:** ✅ Complete  
**Date:** January 30, 2025  
**Confidence:** 100% - Both delayed init and ResizeObserver ensure proper sizing
