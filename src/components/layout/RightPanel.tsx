import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Pin, Star, ChevronRight, TrendingUp,
  Eye, GitBranch, ArrowUpRight,
} from 'lucide-react'
import { documents, docRelations, departments, departmentColors } from '@/data/mockData'
import { Document } from '@/types'
import { cn, formatRelativeTime } from '@/lib/utils'

interface RightPanelProps {
  onNavigateDoc: (docId: string) => void
}

export default function RightPanel({ onNavigateDoc }: RightPanelProps) {
  const pinnedDocs = documents.filter(d => d.isPinned)
  const frequentDocs = documents.filter(d => d.isFrequent)

  return (
    <aside className="w-72 shrink-0 border-l border-border/50 bg-surface/30 backdrop-blur-sm flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <section className="px-4 pt-5 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <Pin className="w-4 h-4 text-brand-amber" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">置顶文档</h3>
          </div>
          <div className="space-y-1">
            {pinnedDocs.map((doc, i) => (
              <PinnedDocItem key={doc.id} doc={doc} index={i} onClick={() => onNavigateDoc(doc.id)} />
            ))}
          </div>
        </section>

        <section className="px-4 py-3 border-t border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-brand-amber/80" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">常用文档</h3>
          </div>
          <div className="space-y-1">
            {frequentDocs.map((doc, i) => (
              <FrequentDocItem key={doc.id} doc={doc} index={i} onClick={() => onNavigateDoc(doc.id)} />
            ))}
          </div>
        </section>

        <section className="px-4 py-3 border-t border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch className="w-4 h-4 text-primary/70" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">文档关联</h3>
          </div>
          <DocRelationshipGraph onNavigateDoc={onNavigateDoc} />
        </section>

        <section className="px-4 py-3 border-t border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-brand-teal" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">热门文档</h3>
          </div>
          <TopViewedDocs onNavigateDoc={onNavigateDoc} />
        </section>
      </div>
    </aside>
  )
}

function PinnedDocItem({ doc, index, onClick }: { doc: Document; index: number; onClick: () => void }) {
  const dept = departments.find(d => d.id === doc.departmentId)
  const color = departmentColors[doc.departmentId] || '#7C5CFC'

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-2.5 rounded-lg hover:bg-surface-hover border border-transparent hover:border-border/50 transition-all duration-200 group animate-fade-in-left"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start gap-2.5">
        <div className="w-1 h-full min-h-[32px] rounded-full shrink-0 mt-0.5" style={{ backgroundColor: color }} />
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-medium leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {doc.title}
          </h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mt-0.5">
            {doc.description}
          </p>
          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground/60">
            <span>{dept?.name}</span>
            <span>·</span>
            <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{doc.views.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </button>
  )
}

function FrequentDocItem({ doc, index, onClick }: { doc: Document; index: number; onClick: () => void }) {
  const color = departmentColors[doc.departmentId] || '#7C5CFC'

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-surface-hover transition-all duration-200 group animate-fade-in-left"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="text-xs flex-1 truncate group-hover:text-primary transition-colors">{doc.title}</span>
      <ChevronRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-primary/50 transition-colors shrink-0" />
    </button>
  )
}

interface GraphNode {
  id: string
  x: number
  y: number
  label: string
  color: string
  r: number
}

function DocRelationshipGraph({ onNavigateDoc }: { onNavigateDoc: (id: string) => void }) {
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const animRef = useRef<number>(0)

  // Build multi-ring layout
  const buildNodes = useCallback(() => {
    const relatedDocIds = new Set<string>()
    docRelations.forEach(r => {
      relatedDocIds.add(r.source)
      relatedDocIds.add(r.target)
    })

    const relatedDocs = Array.from(relatedDocIds).map(id => documents.find(d => d.id === id)).filter(Boolean) as Document[]

    // Calculate importance: more connections = more central
    const connectionCount: Record<string, number> = {}
    docRelations.forEach(r => {
      connectionCount[r.source] = (connectionCount[r.source] || 0) + 1
      connectionCount[r.target] = (connectionCount[r.target] || 0) + 1
    })

    // Sort by connection count: high-connection nodes in inner ring
    const sorted = [...relatedDocs].sort((a, b) => (connectionCount[b.id] || 0) - (connectionCount[a.id] || 0))

    const nodeList: GraphNode[] = []

    // Inner ring: top-connected docs (positioned closer to center)
    const innerCount = Math.min(6, sorted.length)
    const innerDocs = sorted.slice(0, innerCount)
    innerDocs.forEach((doc, i) => {
      const angle = (i / innerCount) * Math.PI * 2 - Math.PI / 2
      const radius = 38
      nodeList.push({
        id: doc.id,
        x: 50 + Math.cos(angle) * radius,
        y: 50 + Math.sin(angle) * radius,
        label: doc.title.length > 8 ? doc.title.slice(0, 8) + '…' : doc.title,
        color: departmentColors[doc.departmentId] || '#7C5CFC',
        r: connectionCount[doc.id] >= 4 ? 5 : 3.5,
      })
    })

    // Outer ring: remaining docs
    const outerDocs = sorted.slice(innerCount)
    const outerCount = outerDocs.length
    outerDocs.forEach((doc, i) => {
      const angle = (i / Math.max(outerCount, 1)) * Math.PI * 2 - Math.PI / 3
      const baseRadius = 65
      const offset = Math.sin(i * 0.8) * 8
      nodeList.push({
        id: doc.id,
        x: 50 + Math.cos(angle) * (baseRadius + offset),
        y: 50 + Math.sin(angle) * (baseRadius + offset),
        label: doc.title.length > 6 ? doc.title.slice(0, 6) + '…' : doc.title,
        color: departmentColors[doc.departmentId] || '#7C5CFC',
        r: 3,
      })
    })

    setNodes(nodeList)
  }, [])

  useEffect(() => {
    buildNodes()
  }, [buildNodes])

  // Connections: filter relations where both nodes exist
  const visibleRelations = docRelations.filter(r =>
    nodes.some(n => n.id === r.source) && nodes.some(n => n.id === r.target)
  )

  // Find connected nodes for hover highlighting
  const connectedIds = hoveredNode
    ? new Set(
        docRelations
          .filter(r => r.source === hoveredNode || r.target === hoveredNode)
          .flatMap(r => [r.source, r.target])
          .filter(id => id !== hoveredNode)
      )
    : new Set<string>()

  return (
    <div className="relative bg-surface/50 rounded-xl border border-border/30 overflow-hidden group" style={{ height: 260 }}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          {/* Background pattern */}
          <pattern id="grid-dots" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="0.25" fill="hsl(var(--muted-foreground) / 0.08)" />
          </pattern>

          {/* Glow filters */}
          <filter id="glow-strong">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-subtle">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient for center */}
          <radialGradient id="center-grad" cx="50%" cy="50%">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.25)" />
            <stop offset="50%" stopColor="hsl(var(--primary) / 0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Background */}
        <rect width="100" height="100" fill="url(#grid-dots)" />
        <circle cx="50" cy="50" r="45" fill="url(#center-grad)" />

        {/* Connection lines */}
        {visibleRelations.map((rel, i) => {
          const source = nodes.find(n => n.id === rel.source)
          const target = nodes.find(n => n.id === rel.target)
          if (!source || !target) return null

          const isHighlighted = hoveredNode === rel.source || hoveredNode === rel.target
          const isDimmed = hoveredNode && !isHighlighted

          return (
            <g key={`edge-${i}`}>
              {/* Glow line (slightly thicker, blurred) */}
              <line
                x1={source.x} y1={source.y}
                x2={target.x} y2={target.y}
                stroke={isHighlighted ? source.color : 'hsl(var(--primary) / 0.15)'}
                strokeWidth={isHighlighted ? 1.2 : 0.5}
                strokeOpacity={isDimmed ? 0.05 : isHighlighted ? 0.8 : 0.3}
                filter={isHighlighted ? 'url(#glow-subtle)' : undefined}
              />
              {/* Animated dash line */}
              <line
                x1={source.x} y1={source.y}
                x2={target.x} y2={target.y}
                stroke={isHighlighted ? source.color : 'hsl(var(--primary) / 0.25)'}
                strokeWidth={isHighlighted ? 0.8 : 0.3}
                strokeDasharray="2 3"
                strokeOpacity={isDimmed ? 0.03 : isHighlighted ? 0.7 : 0.2}
                className="transition-all duration-500"
                style={{
                  strokeDashoffset: isHighlighted ? undefined : 0,
                  animation: isHighlighted ? 'dash-flow 1s linear infinite' : undefined,
                }}
              />
            </g>
          )
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const isHovered = hoveredNode === node.id
          const isSelected = selectedNode === node.id
          const isConnected = connectedIds.has(node.id)
          const isDimmed = hoveredNode && !isHovered && !isConnected
          const nodeR = isHovered || isSelected ? node.r + 1.5 : node.r

          return (
            <g
              key={node.id}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => { setSelectedNode(node.id); onNavigateDoc(node.id) }}
              className="cursor-pointer"
              style={{ transition: 'all 0.3s ease' }}
            >
              {/* Hover glow ring */}
              {(isHovered || isSelected) && (
                <circle
                  cx={node.x} cy={node.y}
                  r={nodeR + 4}
                  fill="none"
                  stroke={node.color}
                  strokeWidth="0.4"
                  strokeOpacity="0.4"
                  filter="url(#glow-strong)"
                  style={{
                    animation: 'node-pulse 2s ease-in-out infinite',
                  }}
                />
              )}

              {/* Outer ring for connected nodes */}
              {isConnected && !isHovered && (
                <circle
                  cx={node.x} cy={node.y}
                  r={nodeR + 2}
                  fill="none"
                  stroke={node.color}
                  strokeWidth="0.3"
                  strokeOpacity="0.5"
                  strokeDasharray="1 2"
                />
              )}

              {/* Main node circle */}
              <circle
                cx={node.x} cy={node.y}
                r={nodeR}
                fill={node.color}
                fillOpacity={isDimmed ? 0.2 : isHovered || isSelected ? 1 : 0.85}
                stroke={isHovered || isSelected ? 'hsl(var(--foreground))' : 'transparent'}
                strokeWidth="0.6"
                filter={(isHovered || isSelected) ? 'url(#glow-subtle)' : undefined}
                className="transition-all duration-300"
              />

              {/* Node label */}
              <text
                x={node.x}
                y={node.y + nodeR + 4.5}
                textAnchor="middle"
                fill="hsl(var(--muted-foreground))"
                fontSize={isHovered || isSelected ? "2.4" : "1.9"}
                fontWeight={isHovered || isSelected ? "500" : "400"}
                className="transition-all duration-300"
                style={{ opacity: isDimmed ? 0.15 : isHovered || isSelected ? 1 : 0.55 }}
              >
                {node.label}
              </text>
            </g>
          )
        })}

        {/* Center hub */}
        <g>
          <circle cx="50" cy="50" r="10" fill="hsl(var(--surface))" stroke="hsl(var(--primary) / 0.2)" strokeWidth="0.6" />
          <circle cx="50" cy="50" r="10" fill="none" stroke="hsl(var(--primary) / 0.15)" strokeWidth="1.2" strokeDasharray="2 2" style={{ animation: 'dash-flow 3s linear infinite' }} />
          <text x="50" y="51.5" textAnchor="middle" fill="hsl(var(--primary))" fontSize="2.8" fontWeight="700" className="text-gradient" style={{ WebkitTextFillColor: 'hsl(var(--primary))', WebkitBackgroundClip: 'unset' }}>
            知识库
          </text>
        </g>

        {/* Hover tooltip - relation label */}
        {hoveredNode && (() => {
          const node = nodes.find(n => n.id === hoveredNode)
          if (!node) return null
          const rels = visibleRelations.filter(r => r.source === node.id || r.target === node.id)
          if (rels.length === 0) return null
          return (
            <g>
              <rect x={2} y={2} width={28} height={7} rx={1.5} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="0.2" opacity="0.95" />
              <text x={16} y={7} textAnchor="middle" fill="hsl(var(--foreground))" fontSize="1.6" fontWeight="500">
                {rels.length} 关联文档
              </text>
            </g>
          )
        })()}
      </svg>

      {/* Bottom hint */}
      <div className="absolute bottom-2 left-0 right-0 text-center">
        <span className="text-[10px] text-muted-foreground/40 pointer-events-none">
          {hoveredNode ? '悬停查看关联 · 点击跳转详情' : '悬停/点击节点交互'}
        </span>
      </div>
    </div>
  )
}

function TopViewedDocs({ onNavigateDoc }: { onNavigateDoc: (id: string) => void }) {
  const topDocs = [...documents].sort((a, b) => b.views - a.views).slice(0, 5)

  return (
    <div className="space-y-1">
      {topDocs.map((doc, i) => (
        <button
          key={doc.id}
          onClick={() => onNavigateDoc(doc.id)}
          className="w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-surface-hover transition-all duration-200 group animate-fade-in-left"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <span className={cn(
            "text-[10px] font-bold tabular-nums w-5 text-center shrink-0",
            i < 3 ? "text-primary" : "text-muted-foreground/50"
          )}>
            {i + 1}
          </span>
          <span className="text-xs flex-1 truncate group-hover:text-primary transition-colors">{doc.title}</span>
          <span className="text-[10px] text-muted-foreground/50 tabular-nums flex items-center gap-0.5 shrink-0">
            <Eye className="w-2.5 h-2.5" />{(doc.views / 1000).toFixed(1)}k
          </span>
        </button>
      ))}
    </div>
  )
}
