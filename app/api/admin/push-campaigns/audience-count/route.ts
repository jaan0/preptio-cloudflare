export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getPushAudienceStats, PushSegment } from '@/lib/push-notifications'

export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const segment = (searchParams.get('segment') || 'all_users') as PushSegment
    const specificEmails = searchParams.get('specificEmails') || undefined
    const newWithinDays = Number(searchParams.get('newWithinDays')) || 1
    const activeWithinDays = Number(searchParams.get('activeWithinDays')) || 7
    const inactiveDays = Number(searchParams.get('inactiveDays')) || 14
    const examDaysBefore = Number(searchParams.get('examDaysBefore')) || 30

    const stats = await getPushAudienceStats({
      segment,
      specificEmails,
      newWithinDays,
      activeWithinDays,
      inactiveDays,
      examDaysBefore,
    })

    return NextResponse.json(stats)
  } catch (error: any) {
    console.error('[admin/push-campaigns/audience-count] GET error:', error)
    return NextResponse.json({ error: error.message || 'Failed to estimate audience' }, { status: 500 })
  }
}
