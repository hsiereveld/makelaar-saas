import * as React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Search, X, Clock, TrendingUp } from "lucide-react"

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') return initialValue
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  return [storedValue, setValue] as const
}

interface SearchBarProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: (query: string) => void
  suggestions?: string[]
  className?: string
  storageKey?: string
}

export function SearchBar({
  placeholder = "Zoeken...",
  value: controlledValue,
  onChange,
  onSearch,
  suggestions = [],
  className,
  storageKey = "searchHistory"
}: SearchBarProps) {
  const [query, setQuery] = useState(controlledValue || '')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>(storageKey, [])
  const debouncedQuery = useDebounce(query, 300)
  const searchRef = useRef<HTMLDivElement>(null)

  // Handle controlled vs uncontrolled
  const searchValue = controlledValue !== undefined ? controlledValue : query
  
  useEffect(() => {
    if (debouncedQuery && onSearch) {
      onSearch(debouncedQuery)
    }
  }, [debouncedQuery, onSearch])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    
    if (controlledValue === undefined) {
      setQuery(newValue)
    }
    
    onChange?.(newValue)
    setShowSuggestions(true)
  }

  const handleSearch = (searchTerm: string) => {
    const trimmedTerm = searchTerm.trim()
    if (!trimmedTerm) return

    // Add to recent searches
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== trimmedTerm)
      return [trimmedTerm, ...filtered].slice(0, 5)
    })

    onSearch?.(trimmedTerm)
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch(searchValue)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const clearSearch = () => {
    if (controlledValue === undefined) {
      setQuery('')
    }
    onChange?.('')
    setShowSuggestions(false)
  }

  const displaySuggestions = suggestions.length > 0 ? suggestions : recentSearches
  const showSuggestionList = showSuggestions && (searchValue.length > 0 || recentSearches.length > 0)

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          type="search"
          value={searchValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 hover:bg-neutral-100"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {showSuggestionList && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {suggestions.length > 0 && searchValue.length > 0 && (
            <div className="p-3 border-b border-neutral-100">
              <p className="text-xs font-medium text-neutral-500 mb-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Suggesties
              </p>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(suggestion)}
                  className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-md"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          
          {recentSearches.length > 0 && (
            <div className="p-3">
              <p className="text-xs font-medium text-neutral-500 mb-2 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Recent gezocht
              </p>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="w-full text-left px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50 rounded-md"
                >
                  {search}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}