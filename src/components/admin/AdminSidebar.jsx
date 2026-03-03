import { ADMIN_TABS } from '../../config/admin'

export default function AdminSidebar({ activeTab, onTabChange }) {
  return (
    <aside className="w-56 shrink-0 border-l border-white/10 bg-white/[0.02] min-h-[calc(100dvh-64px)] p-4 flex flex-col gap-1">
      <h2 className="text-gold font-display text-lg font-bold mb-4 px-2">
        ניהול MindSet
      </h2>
      {ADMIN_TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            w-full text-right px-3 py-2.5 rounded-xl flex items-center gap-2.5
            transition-all duration-200 text-sm font-medium
            ${activeTab === tab.id
              ? 'bg-gold/15 text-gold border border-gold/20'
              : 'text-frost-white/60 hover:bg-white/5 hover:text-frost-white border border-transparent'
            }
          `}
        >
          <span className="text-base">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
      <div className="mt-auto pt-4 border-t border-white/5 px-2">
        <p className="text-[10px] text-white/20">Admin Panel v1.0</p>
      </div>
    </aside>
  )
}
