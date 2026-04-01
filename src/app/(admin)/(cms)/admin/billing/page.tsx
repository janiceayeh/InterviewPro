'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

interface Plan {
  name: string
  price: number
  activeUsers: number
  monthlyRevenue: number
}

interface ChartData {
  month: string
  revenue: number
  subscriptions: number
}

const revenueData: ChartData[] = [
  { month: 'Jan', revenue: 2400, subscriptions: 80 },
  { month: 'Feb', revenue: 3200, subscriptions: 120 },
  { month: 'Mar', revenue: 4100, subscriptions: 160 },
  { month: 'Apr', revenue: 5200, subscriptions: 210 },
  { month: 'May', revenue: 6800, subscriptions: 280 },
  { month: 'Jun', revenue: 8200, subscriptions: 350 },
]

const planData: Plan[] = [
  { name: 'Free', price: 0, activeUsers: 450, monthlyRevenue: 0 },
  { name: 'Pro', price: 29, activeUsers: 320, monthlyRevenue: 9280 },
  { name: 'Enterprise', price: 99, activeUsers: 45, monthlyRevenue: 4455 },
]

export default function BillingPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const totalRevenue = planData.reduce((sum, plan) => sum + plan.monthlyRevenue, 0)
  const totalSubscriptions = planData.reduce((sum, plan) => sum + plan.activeUsers, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Billing & Subscriptions</h1>
        <p className="text-muted-foreground">Manage subscription plans and revenue</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-border/50">
          <p className="text-muted-foreground text-sm mb-2">Monthly Revenue</p>
          <p className="text-3xl font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">+12% from last month</p>
        </Card>
        <Card className="p-6 border-border/50">
          <p className="text-muted-foreground text-sm mb-2">Active Subscriptions</p>
          <p className="text-3xl font-bold text-foreground">{totalSubscriptions}</p>
          <p className="text-xs text-muted-foreground mt-2">+8% from last month</p>
        </Card>
        <Card className="p-6 border-border/50">
          <p className="text-muted-foreground text-sm mb-2">Churn Rate</p>
          <p className="text-3xl font-bold text-foreground">2.4%</p>
          <p className="text-xs text-muted-foreground mt-2">Last 30 days</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="p-6 border-border/50">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">Revenue Trend</h2>
            <p className="text-sm text-muted-foreground">Last 6 months</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0ea5e9"
                name="Revenue ($)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Subscriptions Growth */}
        <Card className="p-6 border-border/50">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">Subscriptions Growth</h2>
            <p className="text-sm text-muted-foreground">Last 6 months</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              <Bar dataKey="subscriptions" fill="#10b981" name="New Subscriptions" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Plans Table */}
      <Card className="p-6 border-border/50">
        <h2 className="text-lg font-semibold text-foreground mb-4">Subscription Plans</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left text-sm font-semibold text-foreground py-3">Plan</th>
                <th className="text-left text-sm font-semibold text-foreground py-3">Price</th>
                <th className="text-left text-sm font-semibold text-foreground py-3">Active Users</th>
                <th className="text-left text-sm font-semibold text-foreground py-3">Monthly Revenue</th>
              </tr>
            </thead>
            <tbody>
              {planData.map((plan) => (
                <tr key={plan.name} className="border-b border-border/30 hover:bg-muted/50">
                  <td className="py-3 text-foreground font-medium">{plan.name}</td>
                  <td className="py-3 text-muted-foreground">${plan.price}/mo</td>
                  <td className="py-3 text-muted-foreground">{plan.activeUsers}</td>
                  <td className="py-3 text-muted-foreground">${plan.monthlyRevenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
