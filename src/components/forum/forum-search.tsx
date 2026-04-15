'use client'

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

interface ForumSearchProps {
  onSearch: (query: string) => void
  onClear: () => void
  placeholder?: string
}

export function ForumSearch({ onSearch, onClear, placeholder = 'Search discussions...' }: ForumSearchProps) {
  const [query, setQuery] = useState('')

  const handleSearch = useCallback(() => {
    onSearch(query)
  }, [query, onSearch])

  const handleClear = useCallback(() => {
    setQuery('')
    onClear()
  }, [onClear])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="flex gap-2">
      <div className="flex-1 relative">
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      </div>
      {query && (
        <Button variant="ghost" size="icon" onClick={handleClear}>
          <X className="size-4" />
        </Button>
      )}
      <Button onClick={handleSearch}>Search</Button>
    </div>
  )
}
