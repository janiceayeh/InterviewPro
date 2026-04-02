'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const questionSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters').max(500, 'Question must be less than 500 characters'),
  category: z.enum(['behavioral', 'technical', 'situational', 'general']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  timeLimit: z.number().min(30, 'Minimum 30 seconds').max(600, 'Maximum 10 minutes').default(120),
  tips: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published']).default('draft'),
})

type QuestionFormData = z.infer<typeof questionSchema>

interface NewQuestionFormProps {
  onClose?: () => void
  onSuccess?: () => void
}

const categories = [
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'technical', label: 'Technical' },
  { value: 'situational', label: 'Situational' },
  { value: 'general', label: 'General' },
]

const difficulties = [
  { value: 'easy', label: 'Easy', color: 'bg-emerald-500/20 text-emerald-700' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-500/20 text-amber-700' },
  { value: 'hard', label: 'Hard', color: 'bg-red-500/20 text-red-700' },
]

export function NewQuestionForm({ onClose, onSuccess }: NewQuestionFormProps) {
  const [tipInput, setTipInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: '',
      category: 'behavioral',
      difficulty: 'medium',
      timeLimit: 120,
      tips: [],
      status: 'draft',
    },
  })

  const handleAddTip = () => {
    if (tipInput.trim() && tipInput.length > 0) {
      const currentTips = form.getValues('tips')
      form.setValue('tips', [...currentTips, tipInput])
      setTipInput('')
    }
  }

  const handleRemoveTip = (index: number) => {
    const currentTips = form.getValues('tips')
    form.setValue('tips', currentTips.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: QuestionFormData) => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/admin/interview-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create question')
      }

      toast.success('Question created successfully')
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error('[v0] Error creating question:', error)
      toast.error('Failed to create question')
    } finally {
      setIsSubmitting(false)
    }
  }

  const tips = form.watch('tips')

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter the interview question..." 
                  className="min-h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {difficulties.map(diff => (
                      <SelectItem key={diff.value} value={diff.value}>
                        {diff.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="timeLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time Limit (seconds)</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  min="30"
                  max="600"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription>Between 30 seconds and 10 minutes</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Tips (Optional)</label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a helpful tip..."
              value={tipInput}
              onChange={(e) => setTipInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTip()
                }
              }}
            />
            <Button type="button" variant="outline" onClick={handleAddTip}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {tips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tips.map((tip, idx) => (
                <Badge key={idx} variant="secondary" className="pl-2">
                  {tip}
                  <button
                    type="button"
                    onClick={() => handleRemoveTip(idx)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Question
          </Button>
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
