# JSX/HTML Style Guide - Agent OS

## Core Principle
**We write JSX/TSX, not HTML** - All markup is in React components using TypeScript.

## Indentation & Formatting

### Basic Rules
- Use 2 spaces for indentation (Prettier default)
- Let Prettier handle formatting - don't fight it
- Use `pnpm format` before committing

### Component Structure
```tsx
// ✅ CORRECT - Clean JSX structure
export function PropertyCard({ property }: Props) {
  return (
    <article className="bg-white rounded-lg shadow-md p-4">
      <header>
        <h2 className="text-xl font-semibold">{property.title}</h2>
        <p className="text-gray-600">{property.location}</p>
      </header>
      
      <div className="mt-4">
        <span className="text-2xl font-bold text-green-600">
          {formatPrice(property.price)}
        </span>
      </div>
      
      <footer className="mt-4 flex justify-between">
        <Button variant="outline">Ver Detalles</Button>
        <Button>Contactar</Button>
      </footer>
    </article>
  )
}
```

## JSX Attribute Formatting

### Single Attribute
```tsx
// ✅ Single attribute stays on one line
<Button variant="primary">Click me</Button>

<input type="text" />
```

### Multiple Attributes (2-3)
```tsx
// ✅ Few attributes can stay on one line if short
<Button variant="primary" size="lg">
  Click me
</Button>

<input type="email" required placeholder="Email" />
```

### Many Attributes (4+)
```tsx
// ✅ Many attributes go multi-line
<Button
  variant="primary"
  size="lg"
  disabled={isLoading}
  className="w-full"
  onClick={handleSubmit}
>
  {isLoading ? 'Guardando...' : 'Guardar'}
</Button>

<input
  type="email"
  name="email"
  value={email}
  placeholder="Correo electrónico"
  required
  disabled={isSubmitting}
  className="w-full px-4 py-2 border rounded-lg"
  onChange={(e) => setEmail(e.target.value)}
/>
```

## Self-Closing Tags

```tsx
// ✅ CORRECT - Always self-close when no children
<Image src="/logo.png" alt="Logo" />
<Input type="text" />
<hr />
<br />

// ❌ WRONG - Don't use closing tag for empty elements
<Image src="/logo.png" alt="Logo"></Image>
<Input type="text"></Input>
```

## Conditional Rendering

### Short Conditionals
```tsx
// ✅ Simple conditionals with &&
{isLoading && <Spinner />}

{error && (
  <Alert variant="error">
    {error.message}
  </Alert>
)}
```

### Ternary for Either/Or
```tsx
// ✅ Ternary for two options
{isAuthenticated ? (
  <UserMenu user={user} />
) : (
  <LoginButton />
)}

// ✅ For simple content
<p>{hasProperties ? `${count} propiedades` : 'Sin propiedades'}</p>
```

### Complex Conditionals
```tsx
// ✅ Extract to function for complex logic
function renderContent() {
  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage error={error} />
  if (!data) return <EmptyState />
  
  return <PropertyList properties={data} />
}

return (
  <div className="container">
    {renderContent()}
  </div>
)
```

## Fragment Usage

```tsx
// ✅ Use Fragment when needed
<>
  <Header />
  <Main />
  <Footer />
</>

// ✅ With key in lists
{items.map(item => (
  <Fragment key={item.id}>
    <dt>{item.label}</dt>
    <dd>{item.value}</dd>
  </Fragment>
))}

// ❌ AVOID - Unnecessary Fragment
<>
  <div>Single element doesn't need Fragment</div>
</>
```

## Lists and Keys

```tsx
// ✅ CORRECT - Proper keys
<ul>
  {properties.map((property) => (
    <li key={property.id}>
      <PropertyCard property={property} />
    </li>
  ))}
</ul>

// ❌ WRONG - Using index as key (unless list is static)
{items.map((item, index) => (
  <div key={index}>{item}</div>
))}
```

## Form Elements

### Input Fields
```tsx
// ✅ Controlled inputs with labels
<div className="form-group">
  <label htmlFor="email" className="block text-sm font-medium mb-1">
    Correo Electrónico
  </label>
  <input
    id="email"
    type="email"
    name="email"
    value={formData.email}
    onChange={handleChange}
    className="w-full px-3 py-2 border rounded-lg"
    required
  />
</div>
```

### Select Elements
```tsx
// ✅ Proper select with React
<select
  value={selectedCity}
  onChange={(e) => setSelectedCity(e.target.value)}
  className="w-full px-3 py-2 border rounded-lg"
>
  <option value="">Seleccionar ciudad</option>
  <option value="pinoso">Pinoso</option>
  <option value="alicante">Alicante</option>
  <option value="valencia">Valencia</option>
</select>
```

### Textarea
```tsx
// ✅ Controlled textarea
<textarea
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={4}
  className="w-full px-3 py-2 border rounded-lg"
  placeholder="Descripción de la propiedad..."
/>
```

## Event Handlers

```tsx
// ✅ Inline for simple handlers
<button onClick={() => setCount(count + 1)}>
  Increment
</button>

// ✅ Extract for complex handlers
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()
  // Complex logic here
}

<form onSubmit={handleSubmit}>
  {/* Form fields */}
</form>

// ❌ AVOID - Creating functions in render
<button onClick={function() { doSomething() }}>
  Click
</button>
```

## Images in Next.js

```tsx
// ✅ Use Next.js Image component
import Image from 'next/image'

<Image
  src="/property.jpg"
  alt="Casa en Pinoso con 3 habitaciones"  // Descriptive alt text
  width={400}
  height={300}
  className="rounded-lg"
  priority={isAboveFold}
/>

// ✅ For unknown dimensions
<Image
  src={property.imageUrl}
  alt={property.title}
  fill
  className="object-cover"
/>

// ❌ AVOID - Regular img tags (unless necessary)
<img src="/property.jpg" alt="Property" />
```

## Links in Next.js

```tsx
// ✅ Use Next.js Link component
import Link from 'next/link'

<Link href="/properties/123" className="text-blue-600 hover:underline">
  Ver detalles
</Link>

// ✅ With button styling
<Link href="/contact">
  <Button variant="primary">Contactar</Button>
</Link>

// ❌ AVOID - Regular anchor tags for internal links
<a href="/properties/123">Ver detalles</a>
```

## Accessibility Patterns

### ARIA Labels
```tsx
// ✅ Add ARIA labels for clarity
<button
  aria-label="Añadir a favoritos"
  onClick={handleFavorite}
>
  <Heart className="w-5 h-5" />
</button>

<nav aria-label="Navegación principal">
  {/* Navigation items */}
</nav>
```

### Semantic HTML
```tsx
// ✅ Use semantic elements
<main>
  <article>
    <header>
      <h1>Título Principal</h1>
    </header>
    
    <section>
      <h2>Sección de Contenido</h2>
      <p>Contenido...</p>
    </section>
    
    <footer>
      <time dateTime="2024-01-15">15 de enero, 2024</time>
    </footer>
  </article>
</main>

// ❌ AVOID - Div soup
<div>
  <div>
    <div>Título Principal</div>
  </div>
</div>
```

## Common Patterns

### Layout Component
```tsx
// ✅ Clean layout structure
export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      
      <Footer />
    </div>
  )
}
```

### Card Component
```tsx
// ✅ Reusable card pattern
export function Card({ title, children, footer }: CardProps) {
  return (
    <article className="bg-white rounded-lg shadow-md">
      {title && (
        <header className="p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
        </header>
      )}
      
      <div className="p-4">
        {children}
      </div>
      
      {footer && (
        <footer className="p-4 border-t bg-gray-50">
          {footer}
        </footer>
      )}
    </article>
  )
}
```

### Modal/Dialog
```tsx
// ✅ Accessible modal pattern
export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
      >
        <header className="p-4 border-b">
          <h2 id="modal-title" className="text-lg font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-4 right-4"
          >
            <X className="w-5 h-5" />
          </button>
        </header>
        
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}
```

## TypeScript Props

```tsx
// ✅ Always type your props
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  className,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(baseStyles, variantStyles[variant], className)}
    >
      {children}
    </button>
  )
}
```

## Do's and Don'ts

### Do's ✅
- Use semantic HTML elements
- Add descriptive alt text for images
- Include ARIA labels for icon buttons
- Use Next.js Link and Image components
- Type all component props
- Extract complex conditionals

### Don'ts ❌
- Don't use index as key in dynamic lists
- Don't create functions in render
- Don't use regular `<a>` tags for internal navigation
- Don't forget htmlFor on labels
- Don't nest interactive elements (button in button)
- Don't use divs when semantic elements exist

## Prettier Config for JSX

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "jsxSingleQuote": false,
  "bracketSameLine": false,
  "jsxBracketSameLine": false,
  "arrowParens": "always"
}
```

## Summary

Key points for JSX in Agent OS:
1. **Let Prettier format** - Don't manually align
2. **Use semantic HTML** - article, section, header, footer
3. **Type everything** - TypeScript interfaces for props
4. **Next.js components** - Link and Image, not a and img
5. **Accessibility** - ARIA labels, proper semantics
6. **Extract complexity** - Keep JSX readable

---

*Remember: This is JSX, not HTML. Think in components, not templates.*