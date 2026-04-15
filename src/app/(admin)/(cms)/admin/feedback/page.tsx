'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Trash2, Eye } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useState, useEffect } from 'react'

interface Feedback {
  id: string
  email: string
  subject: string
  type: 'bug' | 'feature' | 'feedback'
  status: 'new' | 'reviewed' | 'resolved'
  createdAt: string
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await fetch('/api/admin/feedback')
        if (response.ok) {
          const data = await response.json()
          setFeedback(data)
        }
      } catch (error) {
        console.error('Failed to fetch feedback:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeedback()
  }, [])

  const filteredFeedback = feedback.filter(f =>
    f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const typeColor = {
    bug: 'bg-red-500/20 text-red-700',
    feature: 'bg-blue-500/20 text-blue-700',
    feedback: 'bg-amber-500/20 text-amber-700',
  }

  const statusColor = {
    new: 'bg-blue-500/20 text-blue-700',
    reviewed: 'bg-amber-500/20 text-amber-700',
    resolved: 'bg-emerald-500/20 text-emerald-700',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">User Feedback</h1>
          <p className="text-muted-foreground">Review and manage user feedback</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search feedback..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card className="border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 bg-muted/30">
              <TableHead className="text-foreground">Email</TableHead>
              <TableHead className="text-foreground">Subject</TableHead>
              <TableHead className="text-foreground">Type</TableHead>
              <TableHead className="text-foreground">Status</TableHead>
              <TableHead className="text-foreground">Date</TableHead>
              <TableHead className="text-right text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-muted-foreground">Loading feedback...</div>
                </TableCell>
              </TableRow>
            ) : filteredFeedback.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-muted-foreground">No feedback found</div>
                </TableCell>
              </TableRow>
            ) : (
              filteredFeedback.map((item) => (
                <TableRow key={item.id} className="border-border/30 hover:bg-muted/50">
                  <TableCell className="font-medium text-foreground">{item.email}</TableCell>
                  <TableCell className="text-muted-foreground max-w-md truncate">{item.subject}</TableCell>
                  <TableCell>
                    <Badge className={typeColor[item.type]}>
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColor[item.status]}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{item.createdAt}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
