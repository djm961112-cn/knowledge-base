import React, { useState, useEffect, useCallback } from 'react'
import {
  X, Pin, Star, Eye, Tag, ArrowLeft, ExternalLink,
  ChevronRight, FileText, Users, GitBranch, Calendar, BookOpen,
} from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import MainContent from '@/components/layout/MainContent'
import RightPanel from '@/components/layout/RightPanel'
import { documents, departmentColors, categoryColors } from '@/data/mockData'
import { departments } from '@/data/mockData'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRelativeTime, cn } from '@/lib/utils'

// Particle background
function ParticleField() {
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 15}s`,
    duration: `${12 + Math.random() * 18}s`,
    size: 1 + Math.random() * 2,
    opacity: 0.15 + Math.random() * 0.25,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-primary/30"
          style={{
            left: p.left,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animation: `float-particle ${p.duration} ${p.delay} linear infinite`,
          }}
        />
      ))}
    </div>
  )
}

export default function App() {
  const [activeDept, setActiveDept] = useState('all')
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const handleNavigateDoc = useCallback((docId: string) => {
    setSelectedDocId(docId)
    setShowDetail(true)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setShowDetail(false)
    setTimeout(() => setSelectedDocId(null), 300)
  }, [])

  const selectedDoc = selectedDocId ? documents.find(d => d.id === selectedDocId) : null
  const relatedDocsList = selectedDoc
    ? documents.filter(d => selectedDoc.relatedDocs.includes(d.id))
    : []

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden relative">
      {/* Particle background */}
      <ParticleField />

      {/* Top bar */}
      <header className="h-11 border-b border-border/50 bg-surface/40 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-brand-purple to-brand-teal flex items-center justify-center shadow-lg shadow-brand-purple/25">
              <BookOpen className="w-3 h-3 text-white" />
            </div>
            <span className="text-[11px] font-semibold tracking-tight">NexusKB</span>
          </div>
          <span className="text-[10px] text-muted-foreground/40">|</span>
          <span className="text-[11px] text-muted-foreground">
            {activeDept === 'all' ? '知识库首页' : departments.find(d => d.id === activeDept)?.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-teal shadow-[0_0_6px_hsl(var(--brand-teal)/0.6)] animate-pulse" />
            <span>同步状态：正常</span>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        <Sidebar activeDept={activeDept} onDeptChange={setActiveDept} />
        <MainContent activeDept={activeDept} onNavigateDoc={handleNavigateDoc} />
        <RightPanel onNavigateDoc={handleNavigateDoc} />

        {/* Document detail slide-over */}
        {selectedDoc && (
          <>
            {/* Backdrop */}
            <div
              className={cn(
                "absolute inset-0 bg-black/60 backdrop-blur-sm z-20 transition-opacity duration-300",
                showDetail ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              onClick={handleCloseDetail}
            />

            {/* Detail panel */}
            <div className={cn(
              "absolute right-0 top-0 bottom-0 w-[560px] bg-card border-l border-border/50 z-30 shadow-2xl transition-all duration-400 ease-out flex flex-col",
              showDetail ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0 pointer-events-none"
            )}
            style={{ transitionDuration: '400ms', transitionProperty: 'transform, opacity', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              {/* Header */}
              <div className="p-5 border-b border-border/50 shrink-0">
                <div className="flex items-start justify-between mb-3">
                  <button
                    onClick={handleCloseDetail}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>返回列表</span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    {selectedDoc.isPinned && (
                      <Badge variant="warning" className="gap-1">
                        <Pin className="w-2.5 h-2.5" /> 置顶
                      </Badge>
                    )}
                    {selectedDoc.isFrequent && (
                      <Badge variant="warning" className="gap-1 opacity-70">
                        <Star className="w-2.5 h-2.5" /> 常用
                      </Badge>
                    )}
                  </div>
                </div>
                <h2 className="text-lg font-bold leading-tight mb-2">{selectedDoc.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedDoc.description}</p>

                <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{selectedDoc.author}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>更新于 {formatRelativeTime(selectedDoc.updatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span className="tabular-nums">{selectedDoc.views.toLocaleString()} 次浏览</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>v{selectedDoc.version}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: categoryColors[selectedDoc.category],
                      color: categoryColors[selectedDoc.category],
                      backgroundColor: `${categoryColors[selectedDoc.category]}15`,
                    }}
                  >
                    {selectedDoc.category}
                  </Badge>
                  {selectedDoc.tags.map(tag => (
                    <Badge key={tag} variant="ghost">{tag}</Badge>
                  ))}
                  <Badge
                    variant={selectedDoc.status === 'published' ? 'success' : selectedDoc.status === 'draft' ? 'outline' : 'warning'}
                  >
                    {selectedDoc.status === 'published' ? '已发布' : selectedDoc.status === 'draft' ? '草稿' : '评审中'}
                  </Badge>
                </div>
              </div>

              {/* Content area */}
              <div className="flex-1 overflow-y-auto p-5">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-surface/50 border border-border/30">
                    <h3 className="text-sm font-semibold mb-3">文档正文</h3>
                    <div className="space-y-2">
                      {[100, 92, 88, 95, 78, 90, 85, 60].map((w, i) => (
                        <div
                          key={i}
                          className="h-2.5 bg-surface rounded shimmer"
                          style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  </div>

                  {relatedDocsList.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <GitBranch className="w-4 h-4 text-primary/70" />
                        <h3 className="text-sm font-semibold">关联文档 ({relatedDocsList.length})</h3>
                      </div>
                      <div className="space-y-1.5">
                        {relatedDocsList.map((doc) => {
                          const color = departmentColors[doc.departmentId] || '#7C5CFC'
                          return (
                            <button
                              key={doc.id}
                              onClick={() => handleNavigateDoc(doc.id)}
                              className="w-full text-left flex items-center gap-3 p-3 rounded-lg border border-border/30 hover:border-primary/20 hover:bg-surface/50 transition-all duration-200 group"
                            >
                              <div className="w-1.5 h-10 rounded-full shrink-0" style={{ backgroundColor: color }} />
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-medium group-hover:text-primary transition-colors truncate">
                                  {doc.title}
                                </h4>
                                <p className="text-[11px] text-muted-foreground truncate mt-0.5">{doc.description}</p>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary/50 transition-colors shrink-0" />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border/50 shrink-0 flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  在新窗口打开
                </Button>
                <Button size="sm" variant="premium" className="flex-1">
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  编辑文档
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
