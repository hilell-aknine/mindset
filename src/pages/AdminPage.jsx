import { useState, lazy, Suspense } from 'react'
import AdminSidebar from '../components/admin/AdminSidebar'

const DashboardTab = lazy(() => import('../components/admin/tabs/DashboardTab'))
const UsersTab = lazy(() => import('../components/admin/tabs/UsersTab'))
const ContentTab = lazy(() => import('../components/admin/tabs/ContentTab'))
const AnalyticsTab = lazy(() => import('../components/admin/tabs/AnalyticsTab'))
const SettingsTab = lazy(() => import('../components/admin/tabs/SettingsTab'))

const TAB_COMPONENTS = {
  dashboard: DashboardTab,
  users: UsersTab,
  content: ContentTab,
  analytics: AnalyticsTab,
  settings: SettingsTab,
}

function TabFallback() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="glass-card p-6 h-32 animate-pulse" />
      ))}
    </div>
  )
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const ActiveComponent = TAB_COMPONENTS[activeTab]

  return (
    <div className="flex min-h-[calc(100dvh-64px)]" dir="rtl">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-6 overflow-y-auto">
        <Suspense fallback={<TabFallback />}>
          <ActiveComponent />
        </Suspense>
      </main>
    </div>
  )
}
