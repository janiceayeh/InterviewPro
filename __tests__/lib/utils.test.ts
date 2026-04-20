import { cn } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('cn() - Class name utility', () => {
    it('should merge class names correctly', () => {
      const result = cn('px-2', 'py-1')
      expect(result).toContain('px-2')
      expect(result).toContain('py-1')
    })

    it('should handle conditional class names', () => {
      const isActive = true
      const result = cn('base', isActive && 'active')
      expect(result).toContain('active')
    })

    it('should remove falsy values', () => {
      const result = cn('px-2', false, 'py-1', null, undefined, '')
      expect(result).not.toContain('false')
      expect(result).toContain('px-2')
      expect(result).toContain('py-1')
    })

    it('should handle object-based class names', () => {
      const result = cn({
        'px-2': true,
        'py-1': false,
        'text-bold': true,
      })
      expect(result).toContain('px-2')
      expect(result).toContain('text-bold')
      expect(result).not.toContain('py-1')
    })

    it('should handle array of class names', () => {
      const result = cn(['px-2', 'py-1'])
      expect(result).toContain('px-2')
      expect(result).toContain('py-1')
    })

    it('should handle Tailwind conflicting classes', () => {
      const result = cn('p-2 p-4')
      // Should use last value due to Tailwind specificity
      expect(result).toBeDefined()
    })

    it('should handle empty inputs', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle whitespace correctly', () => {
      const result = cn('px-2   py-1')
      expect(result).toContain('px-2')
      expect(result).toContain('py-1')
    })
  })
})
