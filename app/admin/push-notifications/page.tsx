'use client'

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { AdminHeader } from '@/components/admin-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Bell,
  Send,
  Users,
  Smartphone,
  Monitor,
  Sparkles,
  RefreshCw,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Flame,
  Copy,
  Radio,
  Mail,
  Compass,
} from 'lucide-react'
import { toast } from 'sonner'

export type PushSegment =
  | 'all_users'
  | 'specific_users'
  | 'new_users'
  | 'active_users'
  | 'inactive_users'
  | 'never_practiced'
  | 'exam_prep'
  | 'all_devices'

interface PushCampaign {
  id: string
  title: string
  body: string
  url: string
  icon: string
  badge: string
  segment: PushSegment
  specificEmails?: string | null
  newWithinDays: number
  activeWithinDays: number
  inactiveDays: number
  examDaysBefore: number
  totalTargeted: number
  sentCount: number
  failedCount: number
  cleanedCount: number
  status: string
  lastError?: string | null
  sentBy?: string | null
  sentAt: string
  createdAt: string
}

interface StatsSummary {
  totalSubscribers: number
  registeredSubscribers: number
}

interface AudienceStats {
  totalSubscribers: number
  totalRegisteredSubscribers: number
  matchingSubscribers: number
  matchingUsers: number
}

const SEGMENTS: { value: PushSegment; label: string; description: string }[] = [
  {
    value: 'all_users',
    label: 'All Registered Users',
    description: 'All signed-in users who permitted push notifications on their browsers/devices.',
  },
  {
    value: 'specific_users',
    label: 'Specific Users / Custom Emails',
    description: 'Target specific accounts by pasting their email addresses.',
  },
  {
    value: 'new_users',
    label: 'New Users',
    description: 'Users who registered recently within the chosen day window.',
  },
  {
    value: 'active_users',
    label: 'Active Users',
    description: 'Students who completed at least one practice test within recent days.',
  },
  {
    value: 'inactive_users',
    label: 'Inactive Users',
    description: 'Users who have not taken any practice tests within the inactivity window.',
  },
  {
    value: 'never_practiced',
    label: 'Never Practised (signed up, no tests)',
    description: 'Registered users who created an account but have zero completed tests.',
  },
  {
    value: 'exam_prep',
    label: 'Exam Prep Window',
    description: 'Users who have their official exam date coming up soon.',
  },
  {
    value: 'all_devices',
    label: 'All Subscribed Devices (including guests)',
    description: 'Every browser subscription on record, even if not yet signed in.',
  },
]

const QUICK_PRESETS = [
  {
    name: '🔥 Streak Reminder',
    title: 'Keep your streak alive! 🔥',
    body: 'Just 5 minutes of practice today protects your daily study streak. Jump in now!',
    url: '/practice',
  },
  {
    name: '🚀 Platform Update',
    title: 'New Practice Questions Added! 🚀',
    body: 'Fresh exam questions and detailed explanations are now live on Preptio.',
    url: '/practice',
  },
  {
    name: '📚 Spaced Review',
    title: 'Your Spaced Review is Ready ⏳',
    body: 'Review questions you previously struggled with to lock them into long-term memory.',
    url: '/review',
  },
  {
    name: '🎯 Exam Countdown',
    title: 'Exam Day is Approaching 🎯',
    body: 'Test your timing with a timed mock exam to build confidence and endurance.',
    url: '/exam-simulator',
  },
]

const QUICK_URLS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Practice MCQs', path: '/practice' },
  { label: 'Exam Simulator', path: '/exam-simulator' },
  { label: 'Spaced Review', path: '/review' },
  { label: 'Community', path: '/community' },
]

export default function PushNotificationsAdminPage() {
  const [campaigns, setCampaigns] = useState<PushCampaign[]>([])
  const [stats, setStats] = useState<StatsSummary>({ totalSubscribers: 0, registeredSubscribers: 0 })
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [estimating, setEstimating] = useState(false)
  const [audience, setAudience] = useState<AudienceStats | null>(null)
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile')
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)

  // Form State
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [url, setUrl] = useState('/dashboard')
  const [icon, setIcon] = useState('/web-app-manifest-192x192.png')
  const [segment, setSegment] = useState<PushSegment>('all_users')
  const [specificEmails, setSpecificEmails] = useState('')
  const [newWithinDays, setNewWithinDays] = useState(1)
  const [activeWithinDays, setActiveWithinDays] = useState(7)
  const [inactiveDays, setInactiveDays] = useState(14)
  const [examDaysBefore, setExamDaysBefore] = useState(30)

  // Parse emails count
  const parsedEmails = useMemo(() => {
    return specificEmails
      .split(/[\n,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 3 && e.includes('@') && !e.includes(' '))
  }, [specificEmails])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/push-campaigns')
      if (!res.ok) throw new Error('Failed to load campaigns')
      const data = await res.json()
      setCampaigns(data.campaigns || [])
      setStats(data.stats || { totalSubscribers: 0, registeredSubscribers: 0 })
    } catch (err: any) {
      toast.error(err?.message || 'Error fetching push campaigns')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Live audience estimation
  const fetchAudienceEstimate = useCallback(async () => {
    try {
      setEstimating(true)
      const params = new URLSearchParams({
        segment,
        newWithinDays: String(newWithinDays),
        activeWithinDays: String(activeWithinDays),
        inactiveDays: String(inactiveDays),
        examDaysBefore: String(examDaysBefore),
      })
      if (segment === 'specific_users' && specificEmails.trim()) {
        params.set('specificEmails', specificEmails.trim())
      }

      const res = await fetch(`/api/admin/push-campaigns/audience-count?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to estimate audience')
      const data = await res.json()
      setAudience(data)
    } catch (err: any) {
      console.error('Audience estimation error:', err)
    } finally {
      setEstimating(false)
    }
  }, [segment, specificEmails, newWithinDays, activeWithinDays, inactiveDays, examDaysBefore])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAudienceEstimate()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchAudienceEstimate])

  const handleApplyPreset = (preset: (typeof QUICK_PRESETS)[0]) => {
    setTitle(preset.title)
    setBody(preset.body)
    setUrl(preset.url)
    toast.success(`Loaded preset: ${preset.name}`)
  }

  const handleCopyFromCampaign = (c: PushCampaign) => {
    setTitle(c.title)
    setBody(c.body)
    setUrl(c.url)
    setSegment(c.segment)
    if (c.specificEmails) setSpecificEmails(c.specificEmails)
    setNewWithinDays(c.newWithinDays)
    setActiveWithinDays(c.activeWithinDays)
    setInactiveDays(c.inactiveDays)
    setExamDaysBefore(c.examDaysBefore)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    toast.success('Campaign details copied to composer')
  }

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to remove this campaign record from history?')) return
    try {
      const res = await fetch(`/api/admin/push-campaigns/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete campaign')
      toast.success('Campaign removed')
      setCampaigns((prev) => prev.filter((item) => item.id !== id))
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed')
    }
  }

  const handleSendPush = async () => {
    if (!title.trim()) {
      toast.error('Please enter a notification title')
      return
    }
    if (!body.trim()) {
      toast.error('Please enter a message body')
      return
    }
    if (segment === 'specific_users' && parsedEmails.length === 0) {
      toast.error('Please enter at least one valid recipient email')
      return
    }

    setConfirmModalOpen(false)
    setSending(true)

    try {
      const payload = {
        title: title.trim(),
        body: body.trim(),
        url: url.trim() || '/dashboard',
        icon: icon.trim() || '/web-app-manifest-192x192.png',
        segment,
        specificEmails: segment === 'specific_users' ? specificEmails : undefined,
        newWithinDays,
        activeWithinDays,
        inactiveDays,
        examDaysBefore,
      }

      const res = await fetch('/api/admin/push-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to dispatch notification')
      }

      toast.success(
        `Dispatched! Sent to ${result.sentCount} devices (${result.totalTargeted} targeted). ${
          result.cleanedCount > 0 ? `${result.cleanedCount} stale tokens pruned.` : ''
        }`
      )

      // Refresh list
      loadData()
      fetchAudienceEstimate()
    } catch (err: any) {
      toast.error(err?.message || 'Error sending push notification')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header & Stats */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                <Bell className="w-6 h-6 animate-pulse" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Push Notification Campaigns
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Send instant manual push broadcasts to segmented device subscribers.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {stats.totalSubscribers}
                </span>{' '}
                <span className="text-slate-500">Active Devices</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {stats.registeredSubscribers}
                </span>{' '}
                <span className="text-slate-500">Registered</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="h-9 gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Composer & Live Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Composer Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Send className="w-4 h-4 text-blue-600" />
                      Create Push Broadcast
                    </CardTitle>
                    <CardDescription>
                      Deliver directly to users who allowed browser push notifications.
                    </CardDescription>
                  </div>

                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-medium border border-blue-200/50 dark:border-blue-800/40">
                    Manual Trigger
                  </span>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Quick Presets */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Quick Template Starters
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recipient Audience Selector (matching the image) */}
                <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="audience-segment" className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      Recipient Audience
                    </Label>

                    {/* Live Audience Count Badge */}
                    <div className="flex items-center gap-1.5 text-xs">
                      {estimating ? (
                        <span className="flex items-center gap-1 text-slate-500">
                          <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
                          Estimating...
                        </span>
                      ) : audience ? (
                        <span className="px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                          🎯 {audience.matchingSubscribers} device{audience.matchingSubscribers !== 1 ? 's' : ''} ({audience.matchingUsers} user{audience.matchingUsers !== 1 ? 's' : ''})
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <select
                    id="audience-segment"
                    value={segment}
                    onChange={(e) => setSegment(e.target.value as PushSegment)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    {SEGMENTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {SEGMENTS.find((s) => s.value === segment)?.description}
                  </p>

                  {/* Contextual Input Fields for Segments */}
                  {segment === 'specific_users' && (
                    <div className="mt-3 space-y-2 pt-3 border-t border-slate-200/80 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="specific-emails" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-emerald-600" />
                          Recipient Emails (separated by commas or new lines)
                        </Label>
                        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          {parsedEmails.length} valid email{parsedEmails.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <Textarea
                        id="specific-emails"
                        rows={3}
                        placeholder="user1@example.com, user2@example.com&#10;user3@example.com"
                        value={specificEmails}
                        onChange={(e) => setSpecificEmails(e.target.value)}
                        className="text-xs bg-white dark:bg-slate-900"
                      />
                    </div>
                  )}

                  {segment === 'new_users' && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                      <Label htmlFor="new-days" className="text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        Registered within last (days):
                      </Label>
                      <Input
                        id="new-days"
                        type="number"
                        min={1}
                        max={90}
                        value={newWithinDays}
                        onChange={(e) => setNewWithinDays(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-24 h-8 text-xs bg-white dark:bg-slate-900"
                      />
                    </div>
                  )}

                  {segment === 'active_users' && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                      <Label htmlFor="active-days" className="text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        Practised tests within last (days):
                      </Label>
                      <Input
                        id="active-days"
                        type="number"
                        min={1}
                        max={90}
                        value={activeWithinDays}
                        onChange={(e) => setActiveWithinDays(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-24 h-8 text-xs bg-white dark:bg-slate-900"
                      />
                    </div>
                  )}

                  {segment === 'inactive_users' && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                      <Label htmlFor="inactive-days" className="text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        No tests completed in last (days):
                      </Label>
                      <Input
                        id="inactive-days"
                        type="number"
                        min={1}
                        max={180}
                        value={inactiveDays}
                        onChange={(e) => setInactiveDays(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-24 h-8 text-xs bg-white dark:bg-slate-900"
                      />
                    </div>
                  )}

                  {segment === 'exam_prep' && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                      <Label htmlFor="exam-days" className="text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        Exam date scheduled in next (days):
                      </Label>
                      <Input
                        id="exam-days"
                        type="number"
                        min={1}
                        max={180}
                        value={examDaysBefore}
                        onChange={(e) => setExamDaysBefore(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-24 h-8 text-xs bg-white dark:bg-slate-900"
                      />
                    </div>
                  )}
                </div>

                {/* Content Inputs */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notif-title" className="font-semibold text-sm">
                        Notification Title <span className="text-rose-500">*</span>
                      </Label>
                      <span className="text-xs text-slate-400">{title.length}/60 chars</span>
                    </div>
                    <Input
                      id="notif-title"
                      placeholder="e.g. Keep your streak alive! 🔥"
                      value={title}
                      maxLength={80}
                      onChange={(e) => setTitle(e.target.value)}
                      className="font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notif-body" className="font-semibold text-sm">
                        Notification Message Body <span className="text-rose-500">*</span>
                      </Label>
                      <span className="text-xs text-slate-400">{body.length}/140 chars</span>
                    </div>
                    <Textarea
                      id="notif-body"
                      rows={3}
                      placeholder="e.g. Practice 5 questions today to maintain your streak and sharpen your skills."
                      value={body}
                      maxLength={200}
                      onChange={(e) => setBody(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notif-url" className="font-semibold text-sm flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-blue-600" />
                      Target Click URL (Destination Page)
                    </Label>
                    <Input
                      id="notif-url"
                      placeholder="/dashboard"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />

                    {/* Quick URL chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-400 mr-1">Quick Links:</span>
                      {QUICK_URLS.map((item) => (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => setUrl(item.path)}
                          className={`text-xs px-2 py-0.5 rounded-md border transition-all ${
                            url === item.path
                              ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300 font-semibold'
                              : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Send Button */}
                <div className="pt-2">
                  <Button
                    size="lg"
                    onClick={() => setConfirmModalOpen(true)}
                    disabled={sending || !title.trim() || !body.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md gap-2 h-11"
                  >
                    {sending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Broadcasting to Devices...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Push Notification Now
                      </>
                    )}
                  </Button>
                  <p className="text-center text-xs text-slate-400 mt-2">
                    Broadcasts instantly across matching subscribers. Expired or uninstalled device tokens are automatically pruned.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Preview Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm sticky top-6">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    Live Notification Preview
                  </CardTitle>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                        previewDevice === 'mobile'
                          ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xs'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                      title="Mobile Device Preview"
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                        previewDevice === 'desktop'
                          ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xs'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                      title="Desktop Notification Preview"
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Mobile Preview Frame */}
                {previewDevice === 'mobile' ? (
                  <div className="mx-auto max-w-[340px] rounded-[32px] border-4 border-slate-300 dark:border-slate-700 bg-slate-900 p-3 shadow-xl">
                    <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-3" />

                    {/* Lockscreen / Banner Notification Card */}
                    <div className="rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-3.5 shadow-lg border border-white/20 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                          {/* App Icon */}
                          <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">
                            P
                          </div>
                          <span>Preptio</span>
                        </div>
                        <span>now</span>
                      </div>

                      <div className="space-y-0.5">
                        <p className="font-semibold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">
                          {title.trim() || 'Notification Title'}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                          {body.trim() || 'Notification body text will appear here as you type in the composer.'}
                        </p>
                      </div>

                      <div className="pt-1 flex items-center justify-between text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                        <span>Tap to open {url || '/dashboard'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>

                    <div className="mt-8 text-center text-[10px] text-slate-500">
                      Lockscreen / Status Bar Notification
                    </div>
                  </div>
                ) : (
                  /* Desktop Preview Frame */
                  <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 p-4 space-y-3">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Monitor className="w-3 h-3" /> Windows / macOS Browser Toast
                    </div>

                    <div className="rounded-xl bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 p-3.5 space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-xs shrink-0">
                          P
                        </div>
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                              {title.trim() || 'Notification Title'}
                            </p>
                            <span className="text-[10px] text-slate-400">preptio.com</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                            {body.trim() || 'Notification body text will appear here as you type in the composer.'}
                          </p>
                        </div>
                      </div>

                      <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                        <span>Opens {url || '/dashboard'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Audience Summary Card */}
                <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-2 text-xs">
                  <div className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Audience Targeting Summary
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 space-y-1">
                    <div className="flex justify-between">
                      <span>Audience Segment:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {SEGMENTS.find((s) => s.value === segment)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Targeted Active Devices:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {audience?.matchingSubscribers ?? 'Calculating...'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Linked User Accounts:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {audience?.matchingUsers ?? 'Calculating...'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Campaign History Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Broadcast History
              </h2>
              <p className="text-xs text-slate-500">
                Log of past manual push blasts sent through this admin panel.
              </p>
            </div>
            <span className="text-xs text-slate-400">
              Showing last {campaigns.length} broadcast{campaigns.length !== 1 ? 's' : ''}
            </span>
          </div>

          <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {campaigns.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                  <Bell className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  No push broadcasts sent yet
                </div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Use the composer above to compose and send your first push notification broadcast.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      <th className="py-3 px-4 font-semibold">Notification</th>
                      <th className="py-3 px-4 font-semibold">Target Audience</th>
                      <th className="py-3 px-4 font-semibold text-center">Delivered</th>
                      <th className="py-3 px-4 font-semibold text-center">Pruned Expired</th>
                      <th className="py-3 px-4 font-semibold">Sent At</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {campaigns.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                      >
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {c.title}
                          </div>
                          <div className="text-slate-500 truncate text-[11px]">{c.body}</div>
                          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                            {c.url}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {SEGMENTS.find((s) => s.value === c.segment)?.label || c.segment}
                          </span>
                          {c.specificEmails && (
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[160px]">
                              {c.specificEmails}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {c.sentCount}
                          </span>
                          <span className="text-slate-400 text-[10px]"> / {c.totalTargeted}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {c.cleanedCount > 0 ? (
                            <span className="text-amber-600 dark:text-amber-400 font-medium">
                              {c.cleanedCount}
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {new Date(c.sentAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                          {c.sentBy && (
                            <div className="text-[10px] text-slate-400">by {c.sentBy}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {c.status === 'sent' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Sent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {c.lastError || 'Failed'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyFromCampaign(c)}
                            title="Copy to Composer"
                            className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCampaign(c.id)}
                            title="Delete Record"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Confirm Push Broadcast
                </h3>
                <p className="text-xs text-slate-500">
                  Are you ready to send this notification immediately?
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
              <div>
                <span className="text-slate-400">Target Audience:</span>{' '}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {SEGMENTS.find((s) => s.value === segment)?.label}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Estimated Devices:</span>{' '}
                <span className="font-semibold text-emerald-600">
                  {audience?.matchingSubscribers ?? 0} active devices
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-400">Title:</span>{' '}
                <span className="font-medium text-slate-900 dark:text-slate-100">{title}</span>
              </div>
              <div>
                <span className="text-slate-400">Body:</span>{' '}
                <span className="text-slate-600 dark:text-slate-300">{body}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmModalOpen(false)}
                disabled={sending}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSendPush}
                disabled={sending}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5"
              >
                {sending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Confirm & Send Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
