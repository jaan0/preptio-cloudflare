export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  ensurePushCampaignTable,
  sendManualPushCampaign,
  PushSegment,
} from '@/lib/push-notifications'

export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await ensurePushCampaignTable()

    const [campaigns, totalSubscribers, registeredSubscribers] = await Promise.all([
      (prisma as any).pushCampaign.findMany({
        orderBy: { sentAt: 'desc' },
        take: 50,
      }),
      prisma.pushSubscription.count(),
      prisma.pushSubscription.count({ where: { userId: { not: null } } }),
    ])

    return NextResponse.json({
      campaigns,
      stats: {
        totalSubscribers,
        registeredSubscribers,
      },
    })
  } catch (error: any) {
    console.error('[admin/push-campaigns] GET error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch campaigns' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const {
      title,
      body,
      url,
      segment,
      specificEmails,
      newWithinDays,
      activeWithinDays,
      inactiveDays,
      examDaysBefore,
    } = await request.json()

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Notification title is required' }, { status: 400 })
    }
    if (!body?.trim()) {
      return NextResponse.json({ error: 'Notification message body is required' }, { status: 400 })
    }
    if (!segment) {
      return NextResponse.json({ error: 'Recipient audience is required' }, { status: 400 })
    }

    if (segment === 'specific_users' && (!specificEmails || !specificEmails.trim())) {
      return NextResponse.json(
        { error: 'Please enter at least one valid email for specific users' },
        { status: 400 }
      )
    }

    const result = await sendManualPushCampaign({
      title: title.trim(),
      body: body.trim(),
      url: url?.trim() || '/dashboard',
      segment: segment as PushSegment,
      specificEmails: specificEmails?.trim() || undefined,
      newWithinDays: Number(newWithinDays) || 1,
      activeWithinDays: Number(activeWithinDays) || 7,
      inactiveDays: Number(inactiveDays) || 14,
      examDaysBefore: Number(examDaysBefore) || 30,
      sentBy: user.email || user.userId,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[admin/push-campaigns] POST error:', error)
    return NextResponse.json({ error: error.message || 'Failed to send push campaign' }, { status: 500 })
  }
}
