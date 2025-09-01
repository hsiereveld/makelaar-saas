# CSS Style Guide - Agent OS

## Core Principle
**Always use TailwindCSS** - No custom CSS files unless absolutely necessary.

## TailwindCSS Version
- Use TailwindCSS 4.0+ (latest stable)
- Configure with `tailwind.config.js` in project root
- Use Tailwind's default breakpoints (no custom breakpoints)

## Class Organization

### Standard Class Order
When writing Tailwind classes, follow this consistent order:

```tsx
<div className="
  {/* 1. Layout */}
  flex items-center justify-between
  {/* 2. Spacing */}
  p-4 m-2 space-x-4
  {/* 3. Sizing */}
  w-full h-64 max-w-4xl
  {/* 4. Typography */}
  text-lg font-semibold text-center
  {/* 5. Colors & Background */}
  bg-white text-gray-900 
  {/* 6. Borders */}
  border border-gray-200 rounded-lg
  {/* 7. Effects & Animations */}
  shadow-md transition-all duration-200
  {/* 8. States (hover, focus, etc) */}
  hover:shadow-lg focus:outline-none
">
```

### Single-Line vs Multi-Line

#### Single-Line (≤ 5 classes)
```tsx
// ✅ GOOD - Few classes stay on one line
<button className="px-4 py-2 bg-blue-500 text-white rounded">
  Click me
</button>
```

#### Multi-Line (> 5 classes or responsive)
```tsx
// ✅ GOOD - Readable multi-line format
<div
  className="
    flex flex-col gap-4 p-4
    sm:flex-row sm:gap-6 sm:p-6
    lg:gap-8 lg:p-8
    bg-white rounded-lg shadow-md
    hover:shadow-lg transition-shadow
  "
>
  Content
</div>
```

## Responsive Design Pattern

### Mobile-First Approach
```tsx
// ✅ CORRECT - Start with mobile, add larger screens
<div className="
  w-full px-4 py-2        // Mobile (default)
  sm:w-4/5 sm:px-6        // Small screens (640px+)
  md:w-3/4 md:px-8        // Medium screens (768px+)
  lg:w-2/3 lg:px-10       // Large screens (1024px+)
  xl:w-1/2                // Extra large (1280px+)
">

// ❌ AVOID - Don't create custom breakpoints
// No 'xs:' at 400px - use Tailwind defaults
```

### Breakpoint Reference
```css
/* Tailwind Default Breakpoints */
sm: 640px   /* Tablet portrait */
md: 768px   /* Tablet landscape */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large desktop */
```

## Component Styling Patterns

### Using clsx for Conditional Classes
```tsx
// ✅ CORRECT - Use clsx for conditional styling
import { clsx } from 'clsx'

interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        // Base styles (always applied)
        'rounded-lg font-medium transition-colors focus:outline-none focus:ring-2',
        
        // Variant styles
        {
          'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500': variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500': variant === 'secondary',
        },
        
        // Size styles
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        
        // Custom classes (override if needed)
        className
      )}
      {...props}
    />
  )
}
```

### Component with Dark Mode
```tsx
// ✅ CORRECT - Dark mode with Tailwind
<div className="
  bg-white text-gray-900
  dark:bg-gray-900 dark:text-gray-100
  border border-gray-200
  dark:border-gray-700
">
  {/* Content */}
</div>
```

## shadcn/ui Integration

### Using shadcn/ui Components
```tsx
// ✅ CORRECT - Extend shadcn/ui components
import { Button } from '@/packages/ui/button'
import { Card, CardContent, CardHeader } from '@/packages/ui/card'

export function PropertyCard() {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold">Casa en Pinoso</h3>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-green-600">€150,000</p>
        <Button className="w-full mt-4">
          Ver Detalles
        </Button>
      </CardContent>
    </Card>
  )
}
```

### Customizing shadcn/ui Styles
```tsx
// ✅ CORRECT - Override shadcn/ui with className
<Button 
  variant="outline"
  className="border-2 border-blue-500 text-blue-500 hover:bg-blue-50"
>
  Custom Styled Button
</Button>
```

## Form Styling

### Input Fields
```tsx
// ✅ CORRECT - Consistent form styling
<input
  type="text"
  className="
    w-full px-3 py-2
    bg-white border border-gray-300 rounded-md
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    placeholder:text-gray-400
  "
  placeholder="Buscar propiedades..."
/>
```

### Form Layout
```tsx
// ✅ CORRECT - Responsive form grid
<form className="
  grid grid-cols-1 gap-4
  sm:grid-cols-2 sm:gap-6
  lg:grid-cols-3
">
  <div className="sm:col-span-2 lg:col-span-1">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Precio / Price
    </label>
    <input className="..." />
  </div>
  {/* More fields */}
</form>
```

## Common Patterns

### Card Component
```tsx
// ✅ Standard card pattern
<div className="
  bg-white rounded-lg shadow-md
  p-4 sm:p-6
  hover:shadow-lg transition-shadow duration-200
">
  {/* Card content */}
</div>
```

### Modal/Dialog
```tsx
// ✅ Standard modal pattern
<div className="
  fixed inset-0 z-50 
  flex items-center justify-center
  bg-black bg-opacity-50
">
  <div className="
    bg-white rounded-lg shadow-xl
    w-full max-w-md mx-4
    p-6
  ">
    {/* Modal content */}
  </div>
</div>
```

### Navigation Bar
```tsx
// ✅ Responsive navigation
<nav className="
  flex flex-col
  sm:flex-row sm:items-center sm:justify-between
  bg-white border-b border-gray-200
  px-4 py-3
  lg:px-6
">
  {/* Nav content */}
</nav>
```

## Animation Classes

### Standard Transitions
```tsx
// ✅ Use Tailwind's built-in transitions
<button className="
  transition-all duration-200 ease-in-out
  hover:scale-105 hover:shadow-lg
">

// ✅ Common transition patterns
transition-colors     // For color changes
transition-shadow     // For shadow effects
transition-transform  // For scale/rotate
transition-all       // For multiple properties
transition-opacity   // For fade effects
```

### Loading States
```tsx
// ✅ Loading spinner with Tailwind
<div className="
  animate-spin
  h-8 w-8
  border-4 border-gray-200
  border-t-blue-500
  rounded-full
"/>

// ✅ Skeleton loader
<div className="
  animate-pulse
  bg-gray-200
  h-4 w-full
  rounded
"/>
```

## Utility Classes to Avoid

```tsx
// ❌ AVOID - Don't use arbitrary values when standard classes exist
<div className="w-[437px]"> // Bad
<div className="w-96">      // Good (384px)

// ❌ AVOID - Don't mix Tailwind with inline styles
<div className="p-4" style={{ margin: '10px' }}> // Bad
<div className="p-4 m-2.5">                       // Good

// ❌ AVOID - Don't use !important unless absolutely necessary
<div className="!bg-red-500"> // Bad
<div className="bg-red-500">  // Good (fix specificity properly)
```

## Configuration

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './packages/ui/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // Enable dark mode
  theme: {
    extend: {
      colors: {
        // Add brand colors if needed
        brand: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      },
      fontFamily: {
        // Spanish-friendly fonts
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

## Performance Tips

### 1. Purge Unused CSS
```javascript
// tailwind.config.js - Automatic in v4
content: [
  './pages/**/*.tsx',
  './components/**/*.tsx',
]
```

### 2. Avoid Dynamic Classes
```tsx
// ❌ BAD - Tailwind can't detect dynamic classes
const color = 'blue'
<div className={`bg-${color}-500`}>

// ✅ GOOD - Use complete class names
<div className={color === 'blue' ? 'bg-blue-500' : 'bg-red-500'}>
```

### 3. Extract Repeated Patterns
```tsx
// ✅ Extract to component when repeated 3+ times
const cardStyles = 'bg-white rounded-lg shadow-md p-4 hover:shadow-lg'

// Or better, make a component
function Card({ children, className = '' }) {
  return (
    <div className={clsx(cardStyles, className)}>
      {children}
    </div>
  )
}
```

## Accessibility with Tailwind

```tsx
// ✅ Include focus states for keyboard navigation
<button className="
  focus:outline-none 
  focus:ring-2 
  focus:ring-offset-2 
  focus:ring-blue-500
">

// ✅ Screen reader utilities
<span className="sr-only">Navigation menu</span>

// ✅ Proper contrast ratios
text-gray-900  // on bg-white
text-white     // on bg-gray-900
```

## Do's and Don'ts

### Do's ✅
- Use Tailwind's default spacing scale
- Keep responsive prefixes in order (sm → md → lg)
- Use `clsx` for conditional classes
- Group related utilities together
- Use semantic color names from Tailwind

### Don'ts ❌
- Don't create custom breakpoints
- Don't mix inline styles with Tailwind
- Don't use arbitrary values when standards exist
- Don't dynamically construct class names
- Don't write custom CSS unless absolutely necessary

## Summary

The key to good Tailwind CSS in our stack:
1. **Keep it simple** - Use defaults, don't customize unnecessarily
2. **Mobile-first** - Start with base styles, add responsive prefixes
3. **Use clsx** - For conditional styling logic
4. **Consistent ordering** - Same class order everywhere
5. **shadcn/ui** - Use it, extend with className when needed

---

*Remember: Tailwind is a utility framework. If you're writing custom CSS, you're probably doing it wrong.*