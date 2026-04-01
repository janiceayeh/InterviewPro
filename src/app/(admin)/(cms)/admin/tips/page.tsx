'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Trash2, Edit2, Plus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useState, useEffect } from 'react'

interface Tip {
  id: string
  title: string
  category: string
  views: number
  helpful: number
  status: 'published' | 'draft'
  createdAt: string
}

export default function TipsPage() {
  const [tips, setTips] = useState<Tip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const response = await fetch('/api/admin/tips')
        if (response.ok) {
          const data = await response.json()
          setTips(data)
        }
      } catch (error) {
        console.error('Failed to fetch tips:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTips()
  }, [])

  const filteredTips = tips.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Interview Tips</h1>
          <p className="text-muted-foreground">Manage interview tips and advice</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Tip
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tips..."
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
              <TableHead className="text-foreground">Title</TableHead>
              <TableHead className="text-foreground">Category</TableHead>
              <TableHead className="text-foreground">Views</TableHead>
              <TableHead className="text-foreground">Helpful</TableHead>
              <TableHead className="text-foreground">Status</TableHead>
              <TableHead className="text-right text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-muted-foreground">Loading tips...</div>
                </TableCell>
              </TableRow>
            ) : filteredTips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-muted-foreground">No tips found</div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTips.map((tip) => (
                <TableRow key={tip.id} className="border-border/30 hover:bg-muted/50">
                  <TableCell className="font-medium text-foreground max-w-md truncate">
                    {tip.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground capitalize">{tip.category}</TableCell>
                  <TableCell className="text-muted-foreground">{tip.views}</TableCell>
                  <TableCell className="text-muted-foreground">{tip.helpful}</TableCell>
                  <TableCell>
                    <Badge
                      variant={tip.status === 'published' ? 'default' : 'outline'}
                      className={tip.status === 'published' ? 'bg-emerald-500/20 text-emerald-700' : ''}
                    >
                      {tip.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit2 className="h-4 w-4" />
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
