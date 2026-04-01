'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Activity,
  MessageSquare,
  TrendingUp,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const StatCard = ({
  label,
  value,
  icon: Icon,
  trend,
  color = 'text-primary',
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  trend?: { direction: 'up' | 'down'; percent: number }
  color?: string
}) => (
  <Card className="p-6 border-border/50">
    <div className="flex items-start justify-between mb-2">
      <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
      <Icon className={`h-5 w-5 ${color}`} />
    </div>
    <div className="flex items-baseline justify-between">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {trend && (
        <div
          className={`flex items-center gap-1 text-xs font-medium ${
            trend.direction === 'up' ? 'text-success' : 'text-destructive'
          }`}
        >
          {trend.direction === 'up' ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )}
          {trend.percent}%
        </div>
      )}
    </div>
  </Card>
)

const userGrowthData = [
  { month: 'Jan', users: 400, active: 240 },
  { month: 'Feb', users: 520, active: 340 },
  { month: 'Mar', users: 680, active: 480 },
  { month: 'Apr', users: 890, active: 620 },
  { month: 'May', users: 1200, active: 850 },
  { month: 'Jun', users: 1450, active: 1050 },
]

const interviewCategoryData = [
  { category: 'Behavioral', count: 450 },
  { category: 'Technical', count: 380 },
  { category: 'Situational', count: 320 },
  { category: 'General', count: 290 },
]

const forumActivityData = [
  { week: 'W1', posts: 45, answers: 120, engagement: 85 },
  { week: 'W2', posts: 62, answers: 145, engagement: 110 },
  { week: 'W3', posts: 58, answers: 135, engagement: 100 },
  { week: 'W4', posts: 75, answers: 165, engagement: 135 },
]

const completionRateData = [
  { name: 'Completed', value: 68, fill: '#10b981' },
  { name: 'In Progress', value: 22, fill: '#f59e0b' },
  { name: 'Not Started', value: 10, fill: '#ef4444' },
]

const COLORS = ['#0ea5e9', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

export default function AdminDashboard() {
  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: '1,450',
    activeUsers: '1,050',
    totalInterviews: '4,850',
    completionRate: '68%',
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/admin/analytics')
        if (response.ok) {
          const data = await response.json()
          setAnalyticsData(data)
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the InterviewPro admin dashboard</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Users"
          value={analyticsData.totalUsers}
          icon={Users}
          trend={{ direction: 'up', percent: 12 }}
          color="text-blue-500"
        />
        <StatCard
          label="Active Users"
          value={analyticsData.activeUsers}
          icon={Activity}
          trend={{ direction: 'up', percent: 8 }}
          color="text-emerald-500"
        />
        <StatCard
          label="Total Interviews"
          value={analyticsData.totalInterviews}
          icon={TrendingUp}
          trend={{ direction: 'up', percent: 23 }}
          color="text-amber-500"
        />
        <StatCard
          label="Completion Rate"
          value={analyticsData.completionRate}
          icon={MessageSquare}
          trend={{ direction: 'down', percent: 2 }}
          color="text-violet-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <Card className="p-6 border-border/50">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">User Growth Trend</h2>
            <p className="text-sm text-muted-foreground">Last 6 months</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#0ea5e9"
                name="Total Users"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="active"
                stroke="#10b981"
                name="Active Users"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Interview Categories */}
        <Card className="p-6 border-border/50">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">Interviews by Category</h2>
            <p className="text-sm text-muted-foreground">Distribution of completed interviews</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={interviewCategoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="category" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                }}
              />
              <Bar dataKey="count" fill="#0ea5e9" name="Attempts" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Forum Activity */}
        <Card className="p-6 border-border/50">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">Forum Activity</h2>
            <p className="text-sm text-muted-foreground">Last 4 weeks</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={forumActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                }}
              />
              <Legend />
              <Bar dataKey="posts" fill="#0ea5e9" name="New Posts" />
              <Bar dataKey="answers" fill="#10b981" name="Answers" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Completion Rate */}
        <Card className="p-6 border-border/50">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">Interview Completion Status</h2>
            <p className="text-sm text-muted-foreground">User progress breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={completionRateData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {completionRateData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
