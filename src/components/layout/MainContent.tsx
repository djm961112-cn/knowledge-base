import React, { useState, useMemo, useRef, useCallback } from 'react'
import {
  Search, SlidersHorizontal, ArrowUpDown, Plus, Grid3X3, List,
  Eye, Clock, Tag, ChevronDown, Pin, Star, FileText, ExternalLink,
} from 'lucide-react'
import { documents, departments, departmentColors, categoryColors } from '@/data/mockData'
import { Document, DocCategory } from '@/types'
import { cn, formatRelativeTime } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface MainContentProps {
  activeDept: string
  onNavigateDoc: (docId: string) => void
}

type ViewMode = 'grid' | 'list'
type SortKey = 'updated' | 'views' | 'title'

export default function MainContent({ activeDept, onNavigateDoc }: MainContentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortKey>('updated')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredDocs = useMemo(() => {
    let docs = documents

    if (activeDept !== 'all') {
      docs = docs.filter(d => d.departmentId === activeDept)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      docs = docs.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.tags.some(t => t.toLowerCase().includes(q))
      )
    }

    if (selectedCategory !== 'all') {
      docs = docs.filter(d => d.category === selectedCategory)
    }

    return docs.sort((a, b) => {
      switch (sortBy) {
        case 'views': return b.views - a.views
        case 'title': return a.title.localeCompare(b.title, 'zh-CN')
        case 'updated':
        default: return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })
  }, [activeDept, searchQuery, selectedCategory, sortBy])

  const categories: string[] = ['all', ...Array.from(new Set(documents.map(d => d.category)))]

  const getDeptInfo = (deptId: string) => departments.find(d => d.id === deptId)

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border/50 bg-surface/30 backdrop-blur-sm shrink-0 relative overflow-hidden">
        {/* Animated gradient bar when viewing all docs */}
        {activeDept === 'all' && (
          <div
            className="absolute bottom-0 left-0 right-0 h-[2px] opacity-50"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--brand-purple)), hsl(var(--brand-teal)), hsl(var(--brand-purple)))',
              backgroundSize: '200% 100%',
              animation: 'borderGlow 3s linear infinite',
            }}
          />
        )}
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold tracking-tight">
            {activeDept === 'all' ? '全部文档' : getDeptInfo(activeDept)?.name + ' · 知识库'}
          </h2>
          <span className="text-sm text-muted-foreground tabular-nums">
            {filteredDocs.length} 篇文档
          </span>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
            <Input
              placeholder="搜索文档标题、描述或标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-surface/80 border-border/50 focus:bg-surface"
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1.5 bg-surface/80 rounded-lg p-1 border border-border/50">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                  selectedCategory === cat
                    ? "bg-primary/20 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                )}
              >
                {cat === 'all' ? '全部类别' : cat}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1">
            {[
              { key: 'updated' as SortKey, label: '最近更新' },
              { key: 'views' as SortKey, label: '最多浏览' },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setSortBy(item.key)}
                className={cn(
                  "px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                  sortBy === item.key
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-border/50 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 transition-colors",
                viewMode === 'grid' ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              )}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 transition-colors",
                viewMode === 'list' ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              )}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* New doc button */}
          <Button size="sm" variant="premium" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            新建文档
          </Button>
        </div>
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredDocs.map((doc, i) => (
              <DocCard key={doc.id} doc={doc} index={i} onNavigate={onNavigateDoc} />
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredDocs.map((doc, i) => (
              <DocRow key={doc.id} doc={doc} index={i} onNavigate={onNavigateDoc} />
            ))}
          </div>
        )}

        {filteredDocs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <FileText className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm">没有找到匹配的文档</p>
            <p className="text-xs mt-1 opacity-60">尝试调整搜索条件或清空筛选</p>
          </div>
        )}
      </div>
    </main>
  )
}

function DocCard({ doc, index, onNavigate }: { doc: Document; index: number; onNavigate: (id: string) => void }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const dept = departments.find(d => d.id === doc.departmentId)
  const deptColor = departmentColors[doc.departmentId] || '#7C5CFC'

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -6
    const rotateY = ((x - centerX) / centerX) * 6

    card.style.setProperty('--mx', `${(x / rect.width) * 100}%`)
    card.style.setProperty('--my', `${(y / rect.height) * 100}%`)
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px) scale3d(1.015, 1.015, 1.015)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)'
  }, [])

  return (
    <div
      ref={cardRef}
      onClick={() => onNavigate(doc.id)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="card-base p-4 cursor-pointer group animate-fade-in preserve-3d relative"
      style={{
        animationDelay: `${Math.min(index * 60, 400)}ms`,
        transition: 'transform 0.15s ease-out, border-color 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      {/* Mouse-follow glow overlay */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-70 transition-opacity duration-400 pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle 280px at var(--mx, 50%) var(--my, 50%), ${deptColor}12, transparent 60%)`,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: deptColor, boxShadow: `0 0 6px ${deptColor}80` }}
            />
            <span className="text-[11px] text-muted-foreground/70">{dept?.name}</span>
          </div>
          <div className="flex items-center gap-1">
            {doc.isPinned && <Pin className="w-3 h-3 text-brand-amber drop-shadow-[0_0_4px_hsl(var(--brand-amber)/0.5)]" />}
            {doc.isFrequent && <Star className="w-3 h-3 text-brand-amber/60" />}
          </div>
        </div>

        <h3 className="text-sm font-semibold mb-1.5 line-clamp-1 group-hover:text-primary transition-colors duration-200">
          {doc.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
          {doc.description}
        </p>

        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          <Badge
            variant="outline"
            className="text-[10px]"
            style={{
              borderColor: categoryColors[doc.category],
              color: categoryColors[doc.category],
              backgroundColor: `${categoryColors[doc.category]}15`,
            }}
          >
            {doc.category}
          </Badge>
          {doc.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="ghost" className="text-[10px]">{tag}</Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground/70">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatRelativeTime(doc.updatedAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span className="tabular-nums">{doc.views.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function DocRow({ doc, index, onNavigate }: { doc: Document; index: number; onNavigate: (id: string) => void }) {
  const rowRef = useRef<HTMLDivElement>(null)
  const dept = departments.find(d => d.id === doc.departmentId)
  const deptColor = departmentColors[doc.departmentId] || '#7C5CFC'

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const row = rowRef.current
    if (!row) return
    const rect = row.getBoundingClientRect()
    const x = e.clientX - rect.left
    row.style.setProperty('--mx', `${(x / rect.width) * 100}%`)
  }, [])

  return (
    <div
      ref={rowRef}
      onClick={() => onNavigate(doc.id)}
      onMouseMove={handleMouseMove}
      className="flex items-center gap-4 px-4 py-3 rounded-lg border border-border/30 bg-card/40 transition-all duration-300 cursor-pointer group animate-fade-in relative overflow-hidden hover:border-primary/15 hover:bg-card hover:shadow-lg hover:-translate-y-[1px]"
      style={{ animationDelay: `${Math.min(index * 40, 300)}ms` }}
    >
      {/* Hover light sweep */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${deptColor}08 var(--mx, 50%), transparent 100%)`,
        }}
      />

      <div className="flex items-center gap-3 flex-1 min-w-0 relative z-10">
        <div className="flex items-center gap-1.5">
          {doc.isPinned && <Pin className="w-3.5 h-3.5 text-brand-amber shrink-0 drop-shadow-[0_0_4px_hsl(var(--brand-amber)/0.4)]" />}
          {doc.isFrequent && !doc.isPinned && <Star className="w-3.5 h-3.5 text-brand-amber/60 shrink-0" />}
        </div>
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: deptColor, boxShadow: `0 0 6px ${deptColor}80` }}
        />
        <div className="min-w-0">
          <h4 className="text-sm font-medium truncate group-hover:text-primary transition-colors">{doc.title}</h4>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{doc.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 relative z-10">
        <Badge
          variant="outline"
          className="text-[10px]"
          style={{
            borderColor: categoryColors[doc.category],
            color: categoryColors[doc.category],
            backgroundColor: `${categoryColors[doc.category]}15`,
          }}
        >
          {doc.category}
        </Badge>
        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />{formatRelativeTime(doc.updatedAt)}
        </span>
        <span className="text-[11px] text-muted-foreground flex items-center gap-1 tabular-nums">
          <Eye className="w-3 h-3" />{doc.views.toLocaleString()}
        </span>
      </div>
    </div>
  )
}
