'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Trash2, Eye, Flag } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useState, useEffect } from 'react'

interface ForumPost {
  id: string
  title: string
  author: string
  category: string
  answers: number
  flags: number
  status: 'published' | 'flagged' | 'locked'
  createdAt: string
}

export default function ForumModerationPage() {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/admin/forum-moderation')
        if (response.ok) {
          const data = await response.json()
          setPosts(data)
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const statusColor = {
    published: 'bg-emerald-500/20 text-emerald-700',
    flagged: 'bg-red-500/20 text-red-700',
    locked: 'bg-gray-500/20 text-gray-700',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Forum Moderation</h1>
          <p className="text-muted-foreground">Review and moderate forum posts</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search forum posts..."
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
              <TableHead className="text-foreground">Author</TableHead>
              <TableHead className="text-foreground">Category</TableHead>
              <TableHead className="text-foreground">Answers</TableHead>
              <TableHead className="text-foreground">Flags</TableHead>
              <TableHead className="text-foreground">Status</TableHead>
              <TableHead className="text-right text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-muted-foreground">Loading posts...</div>
                </TableCell>
              </TableRow>
            ) : filteredPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-muted-foreground">No posts found</div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPosts.map((post) => (
                <TableRow key={post.id} className="border-border/30 hover:bg-muted/50">
                  <TableCell className="font-medium text-foreground max-w-md truncate">
                    {post.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{post.author}</TableCell>
                  <TableCell className="text-muted-foreground capitalize">{post.category}</TableCell>
                  <TableCell className="text-muted-foreground">{post.answers}</TableCell>
                  <TableCell>
                    {post.flags > 0 ? (
                      <div className="flex items-center gap-1 text-destructive">
                        <Flag className="h-4 w-4" />
                        {post.flags}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColor[post.status]}>
                      {post.status}
                    </Badge>
                  </TableCell>
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
