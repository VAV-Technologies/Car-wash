'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Activity, TrendingUp, Zap } from 'lucide-react'

interface SyncEvent {
  id: number
  event_type: string
  source_table: string
  target_table: string | null
  operation: string
  sync_status: string
  processing_time_ms: number | null
  created_at: string
}

interface CountUpdate {
  type: 'count_update'
  table_name: string
  record_id: string
  count_field: string
  old_count: number
  new_count: number
  delta: number
  timestamp: string
}

interface SyncStats {
  total_events_last_hour: number
  avg_processing_time_ms: number
  active_subscriptions: number
  pending_webhooks: number
}

export function SyncMonitor() {
  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>([])
  const [countUpdates, setCountUpdates] = useState<CountUpdate[]>([])
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Fetch initial sync stats
    fetchSyncStats()

    // Fetch recent sync events
    fetchRecentSyncEvents()

    // Set up real-time subscriptions
    const syncEventsChannel = supabase
      .channel('sync_events')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sync_events'
      }, (payload) => {
        console.log('Real-time sync event:', payload)
        if (payload.eventType === 'INSERT') {
          setSyncEvents(prev => [payload.new as SyncEvent, ...prev.slice(0, 49)]) // Keep last 50
        }
      })
      .subscribe((status) => {
        console.log('Sync events subscription status:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    // Set up PostgreSQL NOTIFY/LISTEN for count updates
    const countUpdatesChannel = supabase
      .channel('count_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_profiles',
        filter: 'listing_count=neq.null'
      }, (payload) => {
        console.log('Count update detected:', payload)
        // This would be enhanced with actual NOTIFY/LISTEN in production
      })
      .subscribe()

    return () => {
      supabase.removeChannel(syncEventsChannel)
      supabase.removeChannel(countUpdatesChannel)
    }
  }, [supabase])

  const fetchSyncStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_realtime_sync_stats')
      if (error) throw error
      setSyncStats(data[0])
    } catch (error) {
      console.error('Error fetching sync stats:', error)
    }
  }

  const fetchRecentSyncEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('sync_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setSyncEvents(data || [])
    } catch (error) {
      console.error('Error fetching sync events:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
      retrying: 'outline'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    )
  }

  const getEventTypeBadge = (eventType: string) => {
    const colors = {
      count_sync: 'bg-blue-100 text-blue-800',
      status_cascade: 'bg-green-100 text-green-800',
      audit_trail: 'bg-purple-100 text-purple-800'
    } as const

    return (
      <Badge className={colors[eventType as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {eventType}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Real-time Sync Monitor
            <Badge variant={isConnected ? 'default' : 'destructive'} className="ml-auto">
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Live monitoring of the Universal Sync Trigger System
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      {syncStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Events (Last Hour)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{syncStats.total_events_last_hour}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {syncStats.avg_processing_time_ms?.toFixed(1) || '0'}ms
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{syncStats.active_subscriptions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Webhooks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{syncStats.pending_webhooks}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Events and Updates Tabs */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Sync Events
          </TabsTrigger>
          <TabsTrigger value="counts" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Count Updates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sync Events</CardTitle>
              <CardDescription>
                Live stream of sync operations across the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {syncEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getEventTypeBadge(event.event_type)}
                      <div className="text-sm">
                        <div className="font-medium">
                          {event.source_table} → {event.target_table || 'N/A'}
                        </div>
                        <div className="text-muted-foreground">
                          {event.operation} • {new Date(event.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.processing_time_ms && (
                        <span className="text-xs text-muted-foreground">
                          {event.processing_time_ms}ms
                        </span>
                      )}
                      {getStatusBadge(event.sync_status)}
                    </div>
                  </div>
                ))}
                {syncEvents.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    No sync events yet. Create some data to see events appear in real-time!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="counts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Count Updates</CardTitle>
              <CardDescription>
                Live updates to listing counts, inquiry counts, and other aggregations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {countUpdates.map((update, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">Count Update</Badge>
                      <div className="text-sm">
                        <div className="font-medium">
                          {update.table_name}.{update.count_field}
                        </div>
                        <div className="text-muted-foreground">
                          {update.old_count} → {update.new_count} ({update.delta > 0 ? '+' : ''}{update.delta})
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(update.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                {countUpdates.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    No count updates yet. Create or modify listings/inquiries to see live updates!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Real-time Integration Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>PostgreSQL NOTIFY/LISTEN Channels:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
              <li><code>sync_events</code> - All sync operations</li>
              <li><code>count_updates</code> - Real-time count changes</li>
              <li><code>sync_user_profiles</code> - User profile sync events</li>
              <li><code>sync_listings</code> - Listing sync events</li>
            </ul>

            <p className="pt-2"><strong>Supabase Realtime:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
              <li>Subscribe to <code>sync_events</code> table for live monitoring</li>
              <li>Subscribe to specific user profiles for personalized updates</li>
              <li>Filter by event types or table names for targeted subscriptions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
