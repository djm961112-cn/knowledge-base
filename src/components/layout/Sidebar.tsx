import React, { useState } from 'react'
import {
  BookOpen, Code2, Lightbulb, Building2, DollarSign, Users, TrendingUp,
  ShieldCheck, Search, Pin, Star, Settings, ChevronRight, ChevronDown,
  Layers, Network, Zap, BarChart3
} from 'lucide-react'
import { departments } from '@/data/mockData'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ElementType> = {
  Code2, Lightbulb, Building2, DollarSign, Users, TrendingUp, ShieldCheck,
}

interface SidebarProps {
  activeDept: string
  onDeptChange: (deptId: string) => void
}

export default function Sidebar({ activeDept, onDeptChange }: SidebarProps) {
  const [insightsOpen, setInsightsOpen] = useState(true)

  return (
    <aside className="w-56 shrink-0 border-r border-border/50 bg-surface/50 backdrop-blur-sm flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-4 pt-5 pb-4 border-b border-border/50">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-purple to-brand-teal flex items-center justify-center shadow-lg shadow-brand-purple/25">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">NexusKB</h1>
            <p className="text-[10px] text-muted-foreground">知识库</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        <div className="px-3 py-1.5 mb-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            知识管理
          </p>
        </div>

        <button
          onClick={() => onDeptChange('all')}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200",
            activeDept === 'all'
              ? "bg-primary/15 text-primary font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
          )}
        >
          <Layers className="w-4 h-4" />
          <span>全部文档</span>
          <span className="ml-auto text-[11px] text-muted-foreground">481</span>
        </button>

        <button
          onClick={() => onDeptChange('all')}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200",
            "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
          )}
        >
          <Pin className="w-4 h-4" />
          <span>置顶文档</span>
        </button>

        <button
          onClick={() => onDeptChange('all')}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200",
            "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
          )}
        >
          <Star className="w-4 h-4" />
          <span>常用文档</span>
        </button>

        {/* Departments */}
        <div className="px-3 pt-4 pb-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            部门知识库
          </p>
        </div>

        {departments.map((dept) => {
          const Icon = iconMap[dept.icon]
          const isActive = activeDept === dept.id
          return (
            <button
              key={dept.id}
              onClick={() => onDeptChange(dept.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 group",
                isActive
                  ? "bg-primary/15 text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              )}
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200 group-hover:scale-125"
                style={{ backgroundColor: dept.color }}
              />
              {Icon && <Icon className="w-4 h-4" />}
              <span className="truncate">{dept.name}</span>
              <span className={cn(
                "ml-auto text-[11px] tabular-nums",
                isActive ? "text-primary" : "text-muted-foreground/70"
              )}>
                {dept.docCount}
              </span>
            </button>
          )
        })}

        {/* Insights section */}
        <div className="px-3 pt-4 pb-1.5">
          <button
            onClick={() => setInsightsOpen(!insightsOpen)}
            className="w-full flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            {insightsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            知识统计
          </button>
        </div>

        {insightsOpen && (
          <div className="space-y-0.5 animate-fade-in">
            {[
              { icon: BarChart3, label: '文档概览', value: '481' },
              { icon: Zap, label: '本周更新', value: '23' },
              { icon: Network, label: '文档关联', value: '89' },
              { icon: ShieldCheck, label: '审核通过率', value: '96%' },
            ].map((item, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-all duration-200"
              >
                <item.icon className="w-3.5 h-3.5 opacity-60" />
                <span className="text-[12px]">{item.label}</span>
                <span className="ml-auto text-[11px] font-mono tabular-nums text-foreground/60">{item.value}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border/50">
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-all duration-200">
          <Settings className="w-4 h-4" />
          <span>知识库设置</span>
        </button>
      </div>
    </aside>
  )
}
