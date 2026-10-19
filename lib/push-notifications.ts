import webpush from 'web-push'
import { prisma } from '@/lib/prisma'

// VAPID configuration is read lazily. Reading env vars and calling
// setVapidDetails at module load made `next build` crash whenever the keys
// were absent at build time (page-data collection imports every route).
let vapidConfigured = false

function getWebPush(): typeof webpush | null {
  if (vapidConfigured) return webpush

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim()
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim()
  if (!publicKey || !privateKey) {
    console.warn('[push] VAPID keys are not configured; push notifications are skipped')
    return null
  }

  webpush.setVapidDetails('mailto:support@preptio.com', publicKey, privateKey)
  vapidConfigured = true
  return webpush
}

export async function broadcastBackOnline() {
  const client = getWebPush()
  if (!client) return

  const subscriptions = await prisma.pushSubscription.findMany()

  const notificationPayload = JSON.stringify({
    title: 'Platform is Back Online! 🚀',
    body: 'Maintenance is complete. You can now resume your studies and timed exams.',
    icon: '/web-app-manifest-512x512.png',
    badge: '/web-app-manifest-512x512.png',
    url: '/dashboard',
  })

  const sendPromises = subscriptions.map((sub) =>
    client.sendNotification(sub.subscription as any, notificationPayload).catch((err: any) => {
      if (err.statusCode === 404 || err.statusCode === 410) {
        // Subscription has expired or is no longer valid
        return prisma.pushSubscription.delete({ where: { id: sub.id } })
      }
      console.error('Push error:', err)
    })
  )

  await Promise.all(sendPromises)
}

export async function sendReviewDuePush(params: { userId: string; dueCount: number }) {
  const client = getWebPush()
  if (!client) return

  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId: params.userId } })
  if (subscriptions.length === 0) return

  const notificationPayload = JSON.stringify({
    title: 'Review Due ⏳',
    body: `You have ${params.dueCount} questions ready for spaced repetition.`,
    icon: '/web-app-manifest-512x512.png',
    badge: '/web-app-manifest-512x512.png',
    url: '/review',
  })

  const sendPromises = subscriptions.map((sub) =>
    client.sendNotification(sub.subscription as any, notificationPayload).catch((err: any) => {
      if (err.statusCode === 404 || err.statusCode === 410) {
        return prisma.pushSubscription.delete({ where: { id: sub.id } })
      }
      console.error('Push error:', err)
    })
  )

  await Promise.all(sendPromises)
}

/**
 * Nudges a user whose active streak is about to break (they practised
 * yesterday but not yet today). Returns true when at least one device accepted
 * the push, so the caller can decide whether to write a frequency-cap log.
 */
export async function sendStreakAtRiskPush(params: { userId: string; streak: number }): Promise<boolean> {
  const client = getWebPush()
  if (!client) return false

  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId: params.userId } })
  if (subscriptions.length === 0) return false

  const notificationPayload = JSON.stringify({
    title: `🔥 Keep your ${params.streak}-day streak alive!`,
    body: 'Practise a few questions before midnight to keep your streak going.',
    icon: '/web-app-manifest-512x512.png',
    badge: '/web-app-manifest-512x512.png',
    url: '/practice',
  })

  let anySent = false
  await Promise.all(
    subscriptions.map((sub) =>
      client
        .sendNotification(sub.subscription as any, notificationPayload)
        .then(() => {
          anySent = true
        })
        .catch((err: any) => {
          if (err.statusCode === 404 || err.statusCode === 410) {
            return prisma.pushSubscription.delete({ where: { id: sub.id } })
          }
          console.error('Push error:', err)
        })
    )
  )

  return anySent
}

export type PushSegment =
  | 'all_users'
  | 'all_devices'
  | 'specific_users'
  | 'new_users'
  | 'active_users'
  | 'inactive_users'
  | 'never_practiced'
  | 'exam_prep'

export interface PushCampaignInput {
  title: string
  body: string
  url?: string
  icon?: string
  badge?: string
  segment: PushSegment
  specificEmails?: string
  newWithinDays?: number
  activeWithinDays?: number
  inactiveDays?: number
  examDaysBefore?: number
  sentBy?: string
}

let tableEnsured = false
export async function ensurePushCampaignTable() {
  if (tableEnsured) return
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "push_campaigns" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "body" TEXT NOT NULL,
        "url" TEXT NOT NULL DEFAULT '/dashboard',
        "icon" TEXT NOT NULL DEFAULT '/web-app-manifest-192x192.png',
        "badge" TEXT NOT NULL DEFAULT '/web-app-manifest-192x192.png',
        "segment" TEXT NOT NULL,
        "specificEmails" TEXT,
        "newWithinDays" INTEGER NOT NULL DEFAULT 1,
        "activeWithinDays" INTEGER NOT NULL DEFAULT 7,
        "inactiveDays" INTEGER NOT NULL DEFAULT 14,
        "examDaysBefore" INTEGER NOT NULL DEFAULT 30,
        "totalTargeted" INTEGER NOT NULL DEFAULT 0,
        "sentCount" INTEGER NOT NULL DEFAULT 0,
        "failedCount" INTEGER NOT NULL DEFAULT 0,
        "cleanedCount" INTEGER NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'sent',
        "lastError" TEXT,
        "sentBy" TEXT,
        "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "push_campaigns_createdAt_idx" ON "push_campaigns"("createdAt");
    `)
    tableEnsured = true
  } catch (err) {
    console.error('[push] Failed to ensure push_campaigns table:', err)
  }
}

export async function resolvePushSubscriptionRecipients(filter: {
  segment: PushSegment
  specificEmails?: string
  newWithinDays?: number
  activeWithinDays?: number
  inactiveDays?: number
  examDaysBefore?: number
}) {
  const now = new Date()
  const segment = filter.segment

  // All Subscribed Devices (both visitors and logged-in users)
  if (segment === 'all_devices') {
    return prisma.pushSubscription.findMany()
  }

  // All Registered Users who enabled push
  if (segment === 'all_users') {
    return prisma.pushSubscription.findMany({
      where: { userId: { not: null } },
    })
  }

  if (segment === 'specific_users') {
    const raw = filter.specificEmails || ''
    const emails = raw
      .split(/[\n,;]+/)
      .map((e: string) => e.trim().toLowerCase())
      .filter((e: string) => e.length > 3 && e.includes('@') && !e.includes(' '))
    const uniqueEmails = Array.from(new Set(emails))
    if (uniqueEmails.length === 0) return []

    const users = await prisma.user.findMany({
      where: { email: { in: uniqueEmails } },
      select: { id: true },
    })
    const userIds = users.map((u) => u.id)
    if (userIds.length === 0) return []

    return prisma.pushSubscription.findMany({
      where: { userId: { in: userIds } },
    })
  }

  if (segment === 'new_users') {
    const days = filter.newWithinDays || 1
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    const users = await prisma.user.findMany({
      where: { createdAt: { gte: cutoff } },
      select: { id: true },
    })
    const userIds = users.map((u) => u.id)
    if (userIds.length === 0) return []

    return prisma.pushSubscription.findMany({
      where: { userId: { in: userIds } },
    })
  }

  if (segment === 'active_users') {
    const days = filter.activeWithinDays || 7
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    const activeResults = await prisma.testResult.findMany({
      where: { createdAt: { gte: cutoff }, userId: { not: null } },
      distinct: ['userId'],
      select: { userId: true },
    })
    const userIds = activeResults.map((item) => item.userId).filter(Boolean) as string[]
    if (userIds.length === 0) return []

    return prisma.pushSubscription.findMany({
      where: { userId: { in: userIds } },
    })
  }

  if (segment === 'inactive_users') {
    const days = filter.inactiveDays || 14
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    const activeResults = await prisma.testResult.findMany({
      where: { createdAt: { gte: cutoff }, userId: { not: null } },
      distinct: ['userId'],
      select: { userId: true },
    })
    const activeIds = activeResults.map((item) => item.userId).filter(Boolean) as string[]
    const inactiveUsers = await prisma.user.findMany({
      where: {
        isBanned: false,
        ...(activeIds.length > 0 ? { id: { notIn: activeIds } } : {}),
      },
      select: { id: true },
    })
    const userIds = inactiveUsers.map((u) => u.id)
    if (userIds.length === 0) return []

    return prisma.pushSubscription.findMany({
      where: { userId: { in: userIds } },
    })
  }

  if (segment === 'never_practiced') {
    const practicedRows = await prisma.testResult.findMany({
      where: { userId: { not: null } },
      distinct: ['userId'],
      select: { userId: true },
    })
    const practicedIds = practicedRows.map((r) => r.userId).filter(Boolean) as string[]
    const neverPracticedUsers = await prisma.user.findMany({
      where: {
        isBanned: false,
        ...(practicedIds.length > 0 ? { id: { notIn: practicedIds } } : {}),
      },
      select: { id: true },
    })
    const userIds = neverPracticedUsers.map((u) => u.id)
    if (userIds.length === 0) return []

    return prisma.pushSubscription.findMany({
      where: { userId: { in: userIds } },
    })
  }

  if (segment === 'exam_prep') {
    const days = filter.examDaysBefore || 30
    const cutoffFuture = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    const prepUsers = await prisma.user.findMany({
      where: {
        isBanned: false,
        examDate: {
          gte: now,
          lte: cutoffFuture,
        },
      },
      select: { id: true },
    })
    const userIds = prepUsers.map((u) => u.id)
    if (userIds.length === 0) return []

    return prisma.pushSubscription.findMany({
      where: { userId: { in: userIds } },
    })
  }

  return []
}

export async function getPushAudienceStats(filter: {
  segment: PushSegment
  specificEmails?: string
  newWithinDays?: number
  activeWithinDays?: number
  inactiveDays?: number
  examDaysBefore?: number
}) {
  const [totalSubscribers, totalRegisteredSubscribers, matchingSubs] = await Promise.all([
    prisma.pushSubscription.count(),
    prisma.pushSubscription.count({ where: { userId: { not: null } } }),
    resolvePushSubscriptionRecipients(filter),
  ])

  // Count unique users represented in matchingSubs
  const uniqueUsers = new Set(matchingSubs.map((s) => s.userId).filter(Boolean))

  return {
    totalSubscribers,
    totalRegisteredSubscribers,
    matchingSubscribers: matchingSubs.length,
    matchingUsers: uniqueUsers.size,
  }
}

export async function sendManualPushCampaign(input: PushCampaignInput) {
  await ensurePushCampaignTable()
  const client = getWebPush()
  if (!client) {
    throw new Error('VAPID keys (NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY) are not configured')
  }

  const subscriptions = await resolvePushSubscriptionRecipients({
    segment: input.segment,
    specificEmails: input.specificEmails,
    newWithinDays: input.newWithinDays,
    activeWithinDays: input.activeWithinDays,
    inactiveDays: input.inactiveDays,
    examDaysBefore: input.examDaysBefore,
  })

  // Deduplicate by endpoint
  const uniqueMap = new Map<string, (typeof subscriptions)[0]>()
  for (const sub of subscriptions) {
    if (sub.endpoint && !uniqueMap.has(sub.endpoint)) {
      uniqueMap.set(sub.endpoint, sub)
    }
  }
  const targets = Array.from(uniqueMap.values())

  const payloadString = JSON.stringify({
    title: input.title || 'Preptio',
    body: input.body,
    icon: input.icon || '/web-app-manifest-192x192.png',
    badge: input.badge || '/web-app-manifest-192x192.png',
    url: input.url || '/dashboard',
  })

  let sentCount = 0
  let failedCount = 0
  let cleanedCount = 0
  let lastError: string | null = null

  // Send in concurrency chunks of 15
  const CHUNK_SIZE = 15
  for (let i = 0; i < targets.length; i += CHUNK_SIZE) {
    const chunk = targets.slice(i, i + CHUNK_SIZE)
    await Promise.all(
      chunk.map(async (sub) => {
        try {
          await client.sendNotification(sub.subscription as any, payloadString)
          sentCount++
        } catch (err: any) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            cleanedCount++
            try {
              await prisma.pushSubscription.delete({ where: { id: sub.id } })
            } catch {
              // Ignore deletion error
            }
          } else {
            failedCount++
            lastError = err?.message || String(err)
            console.error('[push campaign] Send error:', err)
          }
        }
      })
    )
  }

  // Create campaign log record
  const campaign = await (prisma as any).pushCampaign.create({
    data: {
      title: input.title,
      body: input.body,
      url: input.url || '/dashboard',
      icon: input.icon || '/web-app-manifest-192x192.png',
      badge: input.badge || '/web-app-manifest-192x192.png',
      segment: input.segment,
      specificEmails: input.specificEmails || null,
      newWithinDays: input.newWithinDays ?? 1,
      activeWithinDays: input.activeWithinDays ?? 7,
      inactiveDays: input.inactiveDays ?? 14,
      examDaysBefore: input.examDaysBefore ?? 30,
      totalTargeted: targets.length,
      sentCount,
      failedCount,
      cleanedCount,
      status: failedCount > 0 && sentCount === 0 && targets.length > 0 ? 'failed' : 'sent',
      lastError,
      sentBy: input.sentBy || null,
      sentAt: new Date(),
    },
  })

  return {
    success: true,
    campaign,
    totalTargeted: targets.length,
    sentCount,
    failedCount,
    cleanedCount,
  }
}
