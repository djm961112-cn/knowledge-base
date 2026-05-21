export interface Department {
  id: string
  name: string
  icon: string
  color: string
  docCount: number
}

export interface Document {
  id: string
  title: string
  description: string
  departmentId: string
  category: string
  tags: string[]
  author: string
  updatedAt: string
  createdAt: string
  views: number
  isPinned: boolean
  isFrequent: boolean
  relatedDocs: string[]
  status: 'published' | 'draft' | 'reviewing'
  version: string
}

export interface DocRelation {
  source: string
  target: string
  label: string
}

export type DocCategory = '制度规范' | '技术文档' | '产品文档' | '运营手册' | '培训资料' | '会议纪要' | '流程指南'
