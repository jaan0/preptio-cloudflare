export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ensurePushCampaignTable } from '@/lib/push-notifications'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getCurrentUser(request)
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await ensurePushCampaignTable()
    const { id } = await params

    await (prisma as any).pushCampaign.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[admin/push-campaigns/[id]] DELETE error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete campaign' }, { status: 500 })
  }
}
