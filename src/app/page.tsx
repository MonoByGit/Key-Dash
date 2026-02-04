'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Copy, Check, ChevronDown, ChevronUp, Activity, DollarSign, Key, Server, BarChart3, Globe, Cpu, Search, LogOut, Archive } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'

// Cloud icon component
function Cloud({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  )
}

// Types
interface Provider {
  id: string
  name: string
  displayName: string
  icon: string | null
  baseUrl: string | null
  authType: string
  pricing: { inputPer1M: number; outputPer1M: number } | null
  isActive: boolean
  _count?: { keys: number }
}

interface ApiKey {
  id: string
  name: string
  label: string | null
  providerId: string
  provider: Provider
  requests: number
  inputTokens: number
  outputTokens: number
  cost: number
  lastUsedAt: string | null
  isActive: boolean
  archivedAt: string | null
}

interface NewKeyData {
  name: string
  label: string
  key: string
  providerId: string
}

interface NewProviderData {
  name: string
  displayName: string
  icon: string
  baseUrl: string
  authType: string
  inputPricing: number
  outputPricing: number
}

// Provider icons (no emojis)
const PROVIDER_ICONS: Record<string, React.ReactNode> = {
  anthropic: <Cpu className="w-5 h-5" />,
  openai: <Activity className="w-5 h-5" />,
  deepseek: <Search className="w-5 h-5" />,
  minimax: <Cpu className="w-5 h-5" />,
  google: <Globe className="w-5 h-5" />,
  azure: <Cloud className="w-5 h-5" />,
}

// Chart colors - subtle cyberpunk neon for dark theme
const CHART_COLORS = ['#5e9eff', '#a855f7', '#22c55e', '#f97316', '#ec4899', '#06b6d4']

// Mock data for 6 providers with multiple keys each
const MOCK_PROVIDERS = [
  { id: 'mock-1', name: 'anthropic', displayName: 'Anthropic', icon: null, baseUrl: 'https://api.anthropic.com', authType: 'x-api-key', pricing: { inputPer1M: 3, outputPer1M: 15 }, isActive: true },
  { id: 'mock-2', name: 'openai', displayName: 'OpenAI', icon: null, baseUrl: 'https://api.openai.com/v1', authType: 'bearer', pricing: { inputPer1M: 0.5, outputPer1M: 1.5 }, isActive: true },
  { id: 'mock-3', name: 'deepseek', displayName: 'DeepSeek', icon: null, baseUrl: 'https://api.deepseek.com', authType: 'bearer', pricing: { inputPer1M: 0.14, outputPer1M: 0.28 }, isActive: true },
  { id: 'mock-4', name: 'minimax', displayName: 'Minimax', icon: null, baseUrl: 'https://api.minimax.chat/v1', authType: 'bearer', pricing: { inputPer1M: 0.7, outputPer1M: 0.7 }, isActive: true },
  { id: 'mock-5', name: 'google', displayName: 'Google AI', icon: null, baseUrl: 'https://generativelanguage.googleapis.com', authType: 'bearer', pricing: { inputPer1M: 0.5, outputPer1M: 1.5 }, isActive: true },
  { id: 'mock-6', name: 'azure', displayName: 'Azure OpenAI', icon: null, baseUrl: 'https://openai.azure.com', authType: 'bearer', pricing: { inputPer1M: 0.75, outputPer1M: 3 }, isActive: true },
]

const MOCK_KEYS = [
  // Anthropic - 3 keys
  { id: 'k1', name: 'Production Claude', label: 'Main production', providerId: 'mock-1', requests: 4589, inputTokens: 89400, outputTokens: 125600, cost: 245.68, lastUsedAt: '2026-02-03T18:30:00Z', isActive: true, archivedAt: null },
  { id: 'k2', name: 'Development', label: 'Staging env', providerId: 'mock-1', requests: 1245, inputTokens: 23400, outputTokens: 34500, cost: 56.75, lastUsedAt: '2026-02-03T17:45:00Z', isActive: true, archivedAt: null },
  { id: 'k3', name: 'Personal Account', label: 'Experiments', providerId: 'mock-1', requests: 345, inputTokens: 8900, outputTokens: 12300, cost: 23.45, lastUsedAt: '2026-02-02T14:20:00Z', isActive: true, archivedAt: null },
  // OpenAI - 4 keys
  { id: 'k4', name: 'GPT-4o Production', label: 'Main API', providerId: 'mock-2', requests: 12845, inputTokens: 45600, outputTokens: 67800, cost: 123.45, lastUsedAt: '2026-02-03T18:55:00Z', isActive: true, archivedAt: null },
  { id: 'k5', name: 'GPT-4o-mini', label: 'Fast responses', providerId: 'mock-2', requests: 34567, inputTokens: 23400, outputTokens: 45600, cost: 45.68, lastUsedAt: '2026-02-03T18:58:00Z', isActive: true, archivedAt: null },
  { id: 'k6', name: 'Embeddings', label: 'Text embeddings', providerId: 'mock-2', requests: 6789, inputTokens: 123000, outputTokens: 0, cost: 61.50, lastUsedAt: '2026-02-03T16:30:00Z', isActive: true, archivedAt: null },
  { id: 'k7', name: 'Old GPT-4', label: 'Legacy', providerId: 'mock-2', requests: 1234, inputTokens: 4500, outputTokens: 8900, cost: 23.45, lastUsedAt: '2026-01-28T12:00:00Z', isActive: true, archivedAt: null },
  // DeepSeek - 2 keys
  { id: 'k8', name: 'DeepSeek Chat', label: 'Cost effective', providerId: 'mock-3', requests: 8923, inputTokens: 23400, outputTokens: 56700, cost: 14.57, lastUsedAt: '2026-02-03T18:45:00Z', isActive: true, archivedAt: null },
  { id: 'k9', name: 'DeepSeek Coder', label: 'Code assistance', providerId: 'mock-3', requests: 3456, inputTokens: 8900, outputTokens: 23400, cost: 6.79, lastUsedAt: '2026-02-03T17:30:00Z', isActive: true, archivedAt: null },
  // Minimax - 2 keys
  { id: 'k10', name: 'Minimax Chat', label: 'Chinese support', providerId: 'mock-4', requests: 4567, inputTokens: 12300, outputTokens: 34500, cost: 23.45, lastUsedAt: '2026-02-03T18:00:00Z', isActive: true, archivedAt: null },
  { id: 'k11', name: 'Minimax Video', label: 'Video generation', providerId: 'mock-4', requests: 234, inputTokens: 1200, outputTokens: 0, cost: 8.93, lastUsedAt: '2026-02-03T15:00:00Z', isActive: true, archivedAt: null },
  // Google - 2 keys
  { id: 'k12', name: 'Gemini Pro', label: 'Multimodal', providerId: 'mock-5', requests: 3456, inputTokens: 8900, outputTokens: 23400, cost: 17.85, lastUsedAt: '2026-02-03T18:30:00Z', isActive: true, archivedAt: null },
  { id: 'k13', name: 'Gemini Flash', label: 'Fast & cheap', providerId: 'mock-5', requests: 12345, inputTokens: 45600, outputTokens: 12300, cost: 28.95, lastUsedAt: '2026-02-03T18:59:00Z', isActive: true, archivedAt: null },
  // Azure - 2 keys
  { id: 'k14', name: 'Azure GPT-4', label: 'Enterprise', providerId: 'mock-6', requests: 2345, inputTokens: 6700, outputTokens: 15600, cost: 56.79, lastUsedAt: '2026-02-03T18:20:00Z', isActive: true, archivedAt: null },
  { id: 'k15', name: 'Azure Embeddings', label: 'Vector store', providerId: 'mock-6', requests: 8901, inputTokens: 89000, outputTokens: 0, cost: 66.75, lastUsedAt: '2026-02-03T18:50:00Z', isActive: true, archivedAt: null },
]

// Generate 6 months of daily data for charts
function generateMockHistory() {
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']
  const data: Array<Record<string, number | string>> = []

  months.forEach((month, monthIdx) => {
    const daysInMonth = 30
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${month} ${d}`
      const providerData: Record<string, number> = {}

      MOCK_PROVIDERS.forEach((provider, idx) => {
        const baseDaily = (idx + 1) * 15 + Math.random() * 20
        const monthMultiplier = 1 + (monthIdx * 0.15)
        const dayVariation = Math.sin(d * 0.3 + idx * 0.5) * baseDaily * 0.3
        providerData[provider.name] = Math.round((baseDaily * monthMultiplier + dayVariation) * 100) / 100
      })

      data.push({ date: dateStr, ...providerData })
    }
  })

  return data
}

const MOCK_CHART_DATA = generateMockHistory()

export default function Dashboard() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [archivedKeys, setArchivedKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'providers' | 'archive'>('overview')
  const [showAddKeyModal, setShowAddKeyModal] = useState(false)
  const [showAddProviderModal, setShowAddProviderModal] = useState(false)
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set())
  const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month'>('month')
  const [useMockData, setUseMockData] = useState(false)

  // New key form state
  const [newKey, useNewKey] = useState<NewKeyData>({
    name: '',
    label: '',
    key: '',
    providerId: '',
  })

  // New provider form state
  const [newProvider, useNewProvider] = useState<NewProviderData>({
    name: '',
    displayName: '',
    icon: '🌐',
    baseUrl: '',
    authType: 'bearer',
    inputPricing: 0,
    outputPricing: 0,
  })

  // Fetch data
  const fetchData = async () => {
    if (useMockData) return

    try {
      const [providersRes, keysRes, archivedRes] = await Promise.all([
        fetch('/api/providers'),
        fetch('/api/keys'),
        fetch('/api/keys?archived=true'),
      ])

      if (providersRes.ok) {
        const data = await providersRes.json()
        setProviders(data)
      }
      if (keysRes.ok) {
        const data = await keysRes.json()
        setApiKeys(data)
      }
      if (archivedRes.ok) {
        const data = await archivedRes.json()
        setArchivedKeys(data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (useMockData) {
      // Load mock data
      setProviders(MOCK_PROVIDERS.map(p => ({ ...p, _count: { keys: MOCK_KEYS.filter(k => k.providerId === p.id).length } })))
      setApiKeys(MOCK_KEYS.map(k => ({
        ...k,
        provider: MOCK_PROVIDERS.find(p => p.id === k.providerId)!
      })))
      setLoading(false)
    } else {
      // Clear mock data immediately when switching to real data
      setApiKeys([])
      fetchData()
    }
  }, [useMockData])

  // Calculate totals
  const totalCost = apiKeys.reduce((sum, key) => sum + key.cost, 0)
  const totalTokens = apiKeys.reduce((sum, key) => sum + key.inputTokens + key.outputTokens, 0)
  const totalRequests = apiKeys.reduce((sum, key) => sum + key.requests, 0)
  const activeKeys = apiKeys.filter((k) => k.isActive).length

  // Group keys by provider
  const keysByProvider = apiKeys.reduce((acc, key) => {
    if (!acc[key.providerId]) acc[key.providerId] = []
    acc[key.providerId].push(key)
    return acc
  }, {} as Record<string, ApiKey[]>)

  // Generate chart data based on period
  const generateChartData = () => {
    if (useMockData) {
      if (chartPeriod === 'day') {
        // Last 24 hours of current month
        const currentMonth = MOCK_CHART_DATA.slice(-24)
        return currentMonth.map((d, idx) => ({
          date: `${idx}:00`,
          ...Object.fromEntries(Object.entries(d).filter(([k]) => k !== 'date').map(([k, v]) => [k, Number(v) / 5]))
        }))
      } else if (chartPeriod === 'week') {
        // Last 7 days
        const last7 = MOCK_CHART_DATA.slice(-7)
        return last7.map(d => ({
          date: d.date,
          ...Object.fromEntries(Object.entries(d).filter(([k]) => k !== 'date'))
        }))
      } else {
        // Full 6 months
        const monthlyData: Array<{ date: string; [key: string]: number | string }> = []
        const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']
        months.forEach((month, idx) => {
          const monthData = MOCK_CHART_DATA.filter(d => String(d.date).startsWith(month))
          const totals: { date: string; [key: string]: number | string } = { date: month }
          MOCK_PROVIDERS.forEach(p => {
            totals[p.name] = Math.round(monthData.reduce((sum, d) => sum + (Number(d[p.name]) || 0), 0))
          })
          monthlyData.push(totals)
        })
        return monthlyData
      }
    }

    // Real data - use actual totals from API keys
    const totalCost = apiKeys.reduce((sum, key) => sum + key.cost, 0)

    const days = chartPeriod === 'day' ? 24 : chartPeriod === 'week' ? 7 : 30
    const data: Array<Record<string, number | string>> = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = chartPeriod === 'day' ? `${date.getHours()}:00` : date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
      const dayIndex = days - 1 - i
      const providerData: Record<string, number> = {}

      providers.forEach((provider, idx) => {
        const providerKeys = apiKeys.filter((k) => k.providerId === provider.id)
        const providerCost = providerKeys.reduce((sum, k) => sum + k.cost, 0)
        const baseCost = providerCost / 30
        const variation = Math.sin(dayIndex * 0.5 + idx) * baseCost * 0.3
        providerData[provider.name] = Math.max(0, Number((baseCost + variation).toFixed(2)))
      })
      data.push({ date: dateStr, ...providerData })
    }
    return data
  }

  const chartData = generateChartData()

  // Provider comparison data
  const providerComparison = providers.map((provider, idx) => {
    const providerKeys = apiKeys.filter((k) => k.providerId === provider.id)
    const cost = providerKeys.reduce((sum, k) => sum + k.cost, 0)
    return {
      name: provider.displayName,
      cost: Number(cost.toFixed(2)),
      tokens: providerKeys.reduce((sum, k) => sum + k.inputTokens + k.outputTokens, 0),
      color: CHART_COLORS[idx % CHART_COLORS.length],
    }
  })

  // Logout
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  // Add key
  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (useMockData) return
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKey),
      })
      if (res.ok) {
        setShowAddKeyModal(false)
        useNewKey({ name: '', label: '', key: '', providerId: '' })
        fetchData()
      }
    } catch (error) {
      console.error('Error adding key:', error)
    }
  }

  // Add provider
  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault()
    if (useMockData) return
    try {
      const res = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProvider.name.toLowerCase().replace(/\s+/g, '_'),
          displayName: newProvider.displayName,
          icon: null,
          baseUrl: newProvider.baseUrl || null,
          authType: newProvider.authType,
          pricing: {
            inputPer1M: newProvider.inputPricing,
            outputPer1M: newProvider.outputPricing,
          },
        }),
      })
      if (res.ok) {
        setShowAddProviderModal(false)
        useNewProvider({ name: '', displayName: '', icon: '🌐', baseUrl: '', authType: 'bearer', inputPricing: 0, outputPricing: 0 })
        fetchData()
      }
    } catch (error) {
      console.error('Error adding provider:', error)
    }
  }

  // Delete key
  const handleDeleteKey = async (id: string) => {
    if (useMockData) {
      setApiKeys(prev => prev.filter(k => k.id !== id))
      return
    }
    if (!confirm('Weet je zeker dat je deze API key wilt verwijderen?')) return
    try {
      const res = await fetch(`/api/keys/${id}`, { method: 'DELETE' })
      if (res.ok) fetchData()
    } catch (error) {
      console.error('Error deleting key:', error)
    }
  }

  // Delete provider
  const handleDeleteProvider = async (id: string) => {
    if (useMockData) {
      setProviders(prev => prev.filter(p => p.id !== id))
      return
    }
    if (!confirm('Weet je zeker dat je deze provider wilt verwijderen?')) return
    try {
      const res = await fetch(`/api/providers/${id}`, { method: 'DELETE' })
      if (res.ok) fetchData()
    } catch (error) {
      console.error('Error deleting provider:', error)
    }
  }

  // Archive key
  const handleArchive = async (id: string) => {
    if (useMockData) {
      const key = apiKeys.find(k => k.id === id)
      if (key) {
        const archivedKey = { ...key, archivedAt: new Date().toISOString(), isActive: false }
        setApiKeys(prev => prev.filter(k => k.id !== id))
        // Note: We'd need a separate archived state for mock data
      }
      return
    }
    if (!confirm('Archiveren? Stats worden bewaard maar tracking stopt.')) return
    try {
      const res = await fetch(`/api/keys/${id}/archive`, { method: 'POST' })
      if (res.ok) fetchData()
    } catch (error) {
      console.error('Error archiving key:', error)
    }
  }

  // Restore key
  const handleRestore = async (id: string) => {
    if (useMockData) {
      return
    }
    try {
      const res = await fetch(`/api/keys/${id}/restore`, { method: 'POST' })
      if (res.ok) fetchData()
    } catch (error) {
      console.error('Error restoring key:', error)
    }
  }

  // Toggle key active
  const handleToggleKey = async (key: ApiKey) => {
    const newIsActive = !key.isActive
    // Optimistic update - immediately show the change
    setApiKeys(prev => prev.map(k => k.id === key.id ? {
      ...k,
      isActive: newIsActive,
      ...(newIsActive === false && {
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        cost: 0,
        lastUsedAt: null,
      })
    } : k))
    if (useMockData) return
    try {
      const res = await fetch(`/api/keys/${key.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newIsActive }),
      })
      if (res.ok) fetchData()
    } catch (error) {
      console.error('Error toggling key:', error)
      // Revert on error
      fetchData()
    }
  }

  // Copy key
  const handleCopyKey = (keyValue: string, keyId: string) => {
    navigator.clipboard.writeText(keyValue)
    setCopiedKeyId(keyId)
    setTimeout(() => setCopiedKeyId(null), 2000)
  }

  // Toggle provider expansion
  const toggleProvider = (providerId: string) => {
    const newExpanded = new Set(expandedProviders)
    if (newExpanded.has(providerId)) {
      newExpanded.delete(providerId)
    } else {
      newExpanded.add(providerId)
    }
    setExpandedProviders(newExpanded)
  }

  // Get provider icon
  const getProviderIcon = (provider: Provider) => {
    const IconComponent = PROVIDER_ICONS[provider.name]
    if (IconComponent) return IconComponent
    return <Globe className="w-5 h-5" />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#2c2c2e] border-t-[#98989d]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7]">
      {/* Header */}
      <header className="border-b border-[#2c2c2e] bg-[#1c1c1e]/90 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Single row: Logo + Centered Tabs + Right Actions */}
          <div className="flex items-center justify-between gap-4">
            {/* Logo - Left */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="p-1.5 bg-[#3a3a3c] rounded-lg">
                <Activity className="w-5 h-5 text-[#98989d]" />
              </div>
              <h1 className="text-[15px] font-medium text-[#f5f5f7]">AI API Dashboard</h1>
            </div>

            {/* Tabs - Centered */}
            <div className="flex bg-[#2c2c2e] rounded-lg p-0.5 overflow-x-auto scrollbar-hide">
              {['overview', 'keys', 'providers', 'archive'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`px-4 py-1.5 text-[13px] font-medium transition-all duration-200 rounded-md whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-[#3a3a3c] text-[#f5f5f7] shadow-sm'
                      : 'text-[#98989d] hover:text-[#f5f5f7]'
                  }`}
                >
                  {tab === 'overview' ? 'Overzicht' : tab === 'keys' ? 'Sleutels' : tab === 'providers' ? 'Aanbieders' : 'Archief'}
                </button>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Mock Data Toggle */}
              <div className="flex items-center gap-1.5">
                <span className={`text-xs hidden sm:inline ${useMockData ? 'text-[#98989d]' : 'text-[#6e6e73]'}`}>Data</span>
                <button
                  onClick={() => setUseMockData(!useMockData)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    useMockData ? 'bg-[#3a3a3c]' : 'bg-[#2c2c2e]'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-[#98989d] transition-transform ${
                      useMockData ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-2 py-1.5 text-[#98989d] hover:text-[#f5f5f7] hover:bg-[#2c2c2e] rounded-lg transition-colors"
                title="Uitloggen"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 sm:px-5 sm:py-6">
        {/* Stats Cards */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-5 h-5 text-[#8e8e93]" />
                </div>
                <p className="text-[#8e8e93] text-[11px] font-medium uppercase tracking-wide mb-1">Totale Kosten</p>
                <p className="text-[28px] font-semibold text-[#f5f5f7]">${totalCost.toFixed(2)}</p>
              </div>

              <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-5 h-5 text-[#8e8e93]" />
                </div>
                <p className="text-[#8e8e93] text-[11px] font-medium uppercase tracking-wide mb-1">Totaal Tokens</p>
                <p className="text-[28px] font-semibold text-[#f5f5f7]">{totalTokens.toLocaleString()}</p>
              </div>

              <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <Server className="w-5 h-5 text-[#8e8e93]" />
                </div>
                <p className="text-[#8e8e93] text-[11px] font-medium uppercase tracking-wide mb-1">Requests</p>
                <p className="text-[28px] font-semibold text-[#f5f5f7]">{totalRequests.toLocaleString()}</p>
              </div>

              <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <Key className="w-5 h-5 text-[#8e8e93]" />
                </div>
                <p className="text-[#8e8e93] text-[11px] font-medium uppercase tracking-wide mb-1">Actieve Keys</p>
                <p className="text-[28px] font-semibold text-[#f5f5f7]">{activeKeys} <span className="text-[#6e6e73] text-[18px]">/ {apiKeys.length}</span></p>
              </div>
            </div>

            {/* Usage Chart */}
            <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-xl mb-6">
              <div className="px-5 py-3 border-b border-[#2c2c2e] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#8e8e93]" />
                  <h2 className="text-[13px] font-medium text-[#f5f5f7]">Verbruik</h2>
                </div>
                <div className="flex bg-[#2c2c2e] rounded-lg p-0.5">
                  {[
                    { value: 'day', label: 'Dag' },
                    { value: 'week', label: 'Week' },
                    { value: 'month', label: 'Maand' }
                  ].map((period) => (
                    <button
                      key={period.value}
                      onClick={() => setChartPeriod(period.value as typeof chartPeriod)}
                      className={`px-3 py-1 text-[12px] font-medium transition-all duration-200 rounded-md ${
                        chartPeriod === period.value
                          ? 'bg-[#3a3a3c] text-[#f5f5f7]'
                          : 'text-[#98989d] hover:text-[#f5f5f7]'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-5">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#38383a" />
                    <XAxis dataKey="date" stroke="#6e6e73" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6e6e73" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#2c2c2e',
                        border: '1px solid #38383a',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#f5f5f7' }}
                    />
                    <Legend />
                    {providers.map((provider, idx) => (
                      <Area
                        key={provider.name}
                        type="monotone"
                        dataKey={provider.name}
                        stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                        fill={CHART_COLORS[idx % CHART_COLORS.length]}
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Provider Comparison Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-xl">
                  <div className="px-5 py-3 border-b border-[#2c2c2e] flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[#8e8e93]" />
                    <h2 className="text-[13px] font-medium text-[#f5f5f7]">Kosten per Provider</h2>
                  </div>
                  <div className="p-5">
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={providerComparison} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#38383a" horizontal={false} />
                        <XAxis type="number" stroke="#6e6e73" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="name" stroke="#98989d" fontSize={13} width={100} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#2c2c2e', border: '1px solid #38383a', borderRadius: '8px' }} />
                        <Bar dataKey="cost" fill="#5e9eff" radius={4} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-xl">
                  <div className="px-5 py-3 border-b border-[#2c2c2e] flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#8e8e93]" />
                    <h2 className="text-[13px] font-medium text-[#f5f5f7]">Tokens per Provider</h2>
                  </div>
                  <div className="p-5">
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={providerComparison} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#38383a" horizontal={false} />
                        <XAxis type="number" stroke="#6e6e73" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="name" stroke="#98989d" fontSize={13} width={100} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#2c2c2e', border: '1px solid #38383a', borderRadius: '8px' }} />
                        <Bar dataKey="tokens" fill="#22c55e" radius={4} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

            {/* Provider Overview */}
            <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-xl mb-6">
              <div className="px-5 py-3 border-b border-[#2c2c2e] flex items-center justify-between">
                <h2 className="text-[13px] font-medium text-[#f5f5f7]">Aanbieders</h2>
                <button
                  onClick={() => setShowAddProviderModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#3a3a3c] hover:bg-[#555557] text-[#f5f5f7] text-[12px] font-medium rounded-md transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Toevoegen
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-px bg-[#38383a]">
                {providers.map((provider) => {
                  const providerKeys = keysByProvider[provider.id] || []
                  const providerCost = providerKeys.reduce((sum, k) => sum + k.cost, 0)
                  const providerTokens = providerKeys.reduce((sum, k) => sum + k.inputTokens + k.outputTokens, 0)
                  const hasKeys = providerKeys.length > 0

                  return (
                    <div key={provider.id} className="bg-[#1c1c1e] p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-1.5 bg-[#2c2c2e] rounded-lg">
                          {getProviderIcon(provider)}
                        </div>
                        <div>
                          <h3 className="font-medium text-[#f5f5f7]">{provider.displayName}</h3>
                          <p className="text-xs text-[#8e8e93]">{hasKeys ? `${providerKeys.length} sleutels` : 'Geen sleutels'}</p>
                        </div>
                      </div>
                      {hasKeys ? (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[13px]">
                            <span className="text-[#8e8e93]">Kosten</span>
                            <span className="text-[#f5f5f7]">${providerCost.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-[13px]">
                            <span className="text-[#8e8e93]">Tokens</span>
                            <span className="text-[#f5f5f7]">{providerTokens.toLocaleString()}</span>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            useNewKey({ name: '', label: '', key: '', providerId: provider.id })
                            setShowAddKeyModal(true)
                          }}
                          className="w-full mt-1 py-2 px-3 bg-[#3a3a3c] hover:bg-[#555557] text-[#f5f5f7] text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Sleutel toevoegen
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent Keys */}
            <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-xl">
              <div className="px-5 py-3 border-b border-[#2c2c2e] flex items-center justify-between">
                <h2 className="text-[13px] font-medium text-[#f5f5f7]">Recente Sleutels</h2>
                <button
                  onClick={() => setShowAddKeyModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#3a3a3c] hover:bg-[#555557] text-[#f5f5f7] text-[12px] font-medium rounded-md transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nieuwe Sleutel
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[11px] text-[#8e8e93] uppercase tracking-wide border-b border-[#2c2c2e]">
                      <th className="px-5 py-2.5 font-medium">Naam</th>
                      <th className="px-5 py-2.5 font-medium">Provider</th>
                      <th className="px-5 py-2.5 font-medium">Verzoeken</th>
                      <th className="px-5 py-2.5 font-medium">Tokens</th>
                      <th className="px-5 py-2.5 font-medium">Kosten</th>
                      <th className="px-5 py-2.5 font-medium">Status</th>
                      <th className="px-5 py-2.5 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.slice(0, 10).map((key) => (
                      <tr key={key.id} className="border-b border-[#2c2c2e]/50 hover:bg-[#2c2c2e]/30 transition-colors">
                        <td className="px-5 py-3">
                          <div>
                            <p className="text-[#f5f5f7]">{key.name}</p>
                            {key.label && <p className="text-[#8e8e93] text-xs">{key.label}</p>}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-[#2c2c2e] rounded">
                              {getProviderIcon(key.provider)}
                            </div>
                            <span className="text-[#f5f5f7]">{key.provider.displayName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-[#f5f5f7]">{key.requests.toLocaleString()}</td>
                        <td className="px-5 py-3 text-[#f5f5f7]">{(key.inputTokens + key.outputTokens).toLocaleString()}</td>
                        <td className="px-5 py-3 text-[#f5f5f7]">${key.cost.toFixed(2)}</td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${
                              key.isActive ? 'bg-[#30d158]/15 text-[#30d158]' : 'bg-[#2c2c2e] text-[#98989d]'
                            }`}
                          >
                            {key.isActive ? 'Actief' : 'Inactief'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleCopyKey(key.id, key.id)}
                              className="p-1.5 hover:bg-[#2c2c2e] rounded transition-colors"
                              title="Kopieer"
                            >
                              {copiedKeyId === key.id ? (
                                <Check className="w-4 h-4 text-[#30d158]" />
                              ) : (
                                <Copy className="w-4 h-4 text-[#98989d]" />
                              )}
                            </button>
                            <button
                              onClick={() => handleArchive(key.id)}
                              className="p-1.5 hover:bg-[#ff9f0a]/10 rounded transition-colors"
                              title="Archiveren"
                            >
                              <Archive className="w-4 h-4 text-[#ff9f0a]" />
                            </button>
                            <button
                              onClick={() => handleDeleteKey(key.id)}
                              className="p-1.5 hover:bg-[#ff453a]/10 rounded transition-colors"
                              title="Verwijder"
                            >
                              <Trash2 className="w-4 h-4 text-[#ff453a]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {apiKeys.length === 0 && (
                  <div className="py-12 text-center">
                    <Key className="w-12 h-12 mx-auto text-[#48484a] mb-3" />
                    <p className="text-[#8e8e93] text-sm">Nog geen API sleutels toegevoegd</p>
                    <p className="text-[#636366] text-xs mt-1">Klik op "Nieuwe Sleutel" om je eerste API key toe te voegen</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Keys Tab */}
        {activeTab === 'keys' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-medium text-[#f5f5f7]">API Sleutels</h2>
              <button
                onClick={() => setShowAddKeyModal(true)}
                className="flex items-center gap-2 px-4 py-1.5 bg-[#3a3a3c] hover:bg-[#555557] text-[#f5f5f7] text-[13px] font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Sleutel Toevoegen
              </button>
            </div>

            <div className="space-y-3">
              {providers.map((provider) => {
                const providerKeys = keysByProvider[provider.id] || []
                const isExpanded = expandedProviders.has(provider.id)

                return (
                  <div key={provider.id} className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleProvider(provider.id)}
                      className="w-full px-5 py-3 flex items-center justify-between hover:bg-[#2c2c2e]/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-[#2c2c2e] rounded-lg">
                          {getProviderIcon(provider)}
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium text-[#f5f5f7]">{provider.displayName}</h3>
                          <p className="text-sm text-[#8e8e93]">{providerKeys.length} sleutels</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[#98989d]">
                          ${providerKeys.reduce((sum, k) => sum + k.cost, 0).toFixed(2)}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-[#8e8e93]" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-[#8e8e93]" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-[#2c2c2e]">
                        {providerKeys.length === 0 ? (
                          <div className="px-5 py-8 text-center text-[#8e8e93]">
                            Geen sleutels voor deze aanbieder
                          </div>
                        ) : (
                          providerKeys.map((key) => (
                            <div
                              key={key.id}
                              className="px-5 py-3 border-b border-[#2c2c2e] last:border-0 flex items-center justify-between hover:bg-[#2c2c2e]/30 transition-colors"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-[#f5f5f7]">{key.name}</span>
                                  {key.label && (
                                    <span className="px-2 py-0.5 bg-[#2c2c2e] text-xs text-[#98989d] rounded">
                                      {key.label}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 mt-1.5 text-sm text-[#8e8e93]">
                                  <span>{key.requests.toLocaleString()} requests</span>
                                  <span>{(key.inputTokens + key.outputTokens).toLocaleString()} tokens</span>
                                  <span>${key.cost.toFixed(2)}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 ml-4">
                                <button
                                  onClick={() => handleToggleKey(key)}
                                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                                    key.isActive
                                      ? 'bg-[#30d158]/15 text-[#30d158] hover:bg-[#30d158]/20'
                                      : 'bg-[#2c2c2e] text-[#98989d] hover:bg-[#3a3a3c]'
                                  }`}
                                >
                                  {key.isActive ? 'Actief' : 'Inactief'}
                                </button>
                                <button
                                  onClick={() => handleCopyKey(key.id, key.id)}
                                  className="p-1.5 hover:bg-[#2c2c2e] rounded transition-colors"
                                >
                                  {copiedKeyId === key.id ? (
                                    <Check className="w-4 h-4 text-[#30d158]" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-[#98989d]" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleArchive(key.id)}
                                  className="p-1.5 hover:bg-[#ff9f0a]/10 rounded transition-colors"
                                  title="Archiveren"
                                >
                                  <Archive className="w-4 h-4 text-[#ff9f0a]" />
                                </button>
                                <button
                                  onClick={() => handleDeleteKey(key.id)}
                                  className="p-1.5 hover:bg-[#ff453a]/10 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 text-[#ff453a]" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Providers Tab */}
        {activeTab === 'providers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-medium text-[#f5f5f7]">Aanbieders</h2>
              <button
                onClick={() => setShowAddProviderModal(true)}
                className="flex items-center gap-2 px-4 py-1.5 bg-[#3a3a3c] hover:bg-[#555557] text-[#f5f5f7] text-[13px] font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Aanbieder Toevoegen
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map((provider) => (
                <div key={provider.id} className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#2c2c2e] rounded-lg">
                        {getProviderIcon(provider)}
                      </div>
                      <div>
                        <h3 className="font-medium text-[#f5f5f7]">{provider.displayName}</h3>
                        <p className="text-sm text-[#8e8e93]">{provider.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteProvider(provider.id)}
                      className="p-1.5 hover:bg-[#ff453a]/10 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-[#ff453a]" />
                    </button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#8e8e93]">Auth</span>
                      <span className="text-[#f5f5f7]">{provider.authType}</span>
                    </div>
                    {provider.baseUrl && (
                      <div className="flex justify-between">
                        <span className="text-[#8e8e93]">Endpoint</span>
                        <span className="text-[#f5f5f7] truncate max-w-[140px]">{provider.baseUrl}</span>
                      </div>
                    )}
                    {provider.pricing && (
                      <div className="flex justify-between">
                        <span className="text-[#8e8e93]">Pricing</span>
                        <span className="text-[#f5f5f7]">
                          ${provider.pricing.inputPer1M}/M in, ${provider.pricing.outputPer1M}/M out
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-[#8e8e93]">Sleutels</span>
                      <span className="text-[#f5f5f7]">{provider._count?.keys || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Archive Tab */}
        {activeTab === 'archive' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[17px] font-medium text-[#f5f5f7]">Archief</h2>
                <p className="text-sm text-[#8e8e93]">Gearchiveerde API sleutels worden niet meer getracked</p>
              </div>
            </div>

            {archivedKeys.length === 0 ? (
              <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-xl p-8 text-center">
                <p className="text-[#8e8e93]">Geen gearchiveerde sleutels</p>
              </div>
            ) : (
              <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1a1a25]">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#8e8e93]">Naam</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#8e8e93]">Provider</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#8e8e93]">Kosten</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#8e8e93]">Tokens</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#8e8e93]">Archief datum</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-[#8e8e93]">Acties</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archivedKeys.map((key) => (
                      <tr key={key.id} className="border-b border-[#2c2c2e]/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-[#2c2c2e] rounded">
                              {getProviderIcon(key.provider)}
                            </div>
                            <div>
                              <p className="text-sm text-[#f5f5f7]">{key.name}</p>
                              {key.label && <p className="text-xs text-[#8e8e93]">{key.label}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#8e8e93]">{key.provider.displayName}</td>
                        <td className="px-4 py-3 text-sm text-[#f5f5f7]">${key.cost.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-[#f5f5f7]">{(key.inputTokens + key.outputTokens).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-[#8e8e93]">
                          {key.archivedAt ? new Date(key.archivedAt).toLocaleDateString('nl-NL') : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleRestore(key.id)}
                            className="px-3 py-1 bg-[#3a3a3c] hover:bg-[#555557] text-[#f5f5f7] text-xs font-medium rounded-lg transition-colors"
                          >
                            Herstellen
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Key Modal */}
      {showAddKeyModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c1e] border border-[#2c2c2e] w-full max-w-md rounded-xl">
            <div className="px-5 py-3 border-b border-[#2c2c2e]">
              <h2 className="text-[15px] font-medium text-[#f5f5f7]">Nieuwe API Key</h2>
            </div>

            <form onSubmit={handleAddKey} className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-[#8e8e93] mb-2">Naam</label>
                <input
                  type="text"
                  value={newKey.name}
                  onChange={(e) => useNewKey({ ...newKey, name: e.target.value })}
                  className="w-full px-4 py-2 bg-[#2c2c2e] border border-[#3a3a3c] text-[#f5f5f7] text-[14px] rounded-lg focus:outline-none focus:border-[#636366]"
                  placeholder="Bijv. Development Key"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-[#8e8e93] mb-2">Label (optioneel)</label>
                <input
                  type="text"
                  value={newKey.label}
                  onChange={(e) => useNewKey({ ...newKey, label: e.target.value })}
                  className="w-full px-4 py-2 bg-[#2c2c2e] border border-[#3a3a3c] text-[#f5f5f7] text-[14px] rounded-lg focus:outline-none focus:border-[#636366]"
                  placeholder="Bijv. Project X"
                />
              </div>

              <div>
                <label className="block text-sm text-[#8e8e93] mb-2">Provider</label>
                <div className="relative">
                  <select
                    value={newKey.providerId}
                    onChange={(e) => useNewKey({ ...newKey, providerId: e.target.value })}
                    className="w-full px-4 py-2 bg-[#2c2c2e] border border-[#3a3a3c] text-[#f5f5f7] text-[14px] rounded-lg appearance-none focus:outline-none focus:border-[#636366]"
                    required
                  >
                    <option value="">Selecteer...</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>{p.displayName}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636366] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#8e8e93] mb-2">API Key</label>
                <input
                  type="password"
                  value={newKey.key}
                  onChange={(e) => useNewKey({ ...newKey, key: e.target.value })}
                  className="w-full px-4 py-2 bg-[#2c2c2e] border border-[#3a3a3c] text-[#f5f5f7] text-[14px] rounded-lg focus:outline-none focus:border-[#636366]"
                  placeholder="sk-..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddKeyModal(false)} className="flex-1 px-4 py-2 bg-[#2c2c2e] hover:bg-[#3a3a3c] text-[#f5f5f7] text-[14px] font-medium rounded-lg transition-colors">Annuleren</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-[#3a3a3c] hover:bg-[#555557] text-[#f5f5f7] text-[14px] font-medium rounded-lg transition-colors">Toevoegen</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Provider Modal */}
      {showAddProviderModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c1e] border border-[#2c2c2e] w-full max-w-md rounded-xl">
            <div className="px-5 py-3 border-b border-[#2c2c2e]">
              <h2 className="text-[15px] font-medium text-[#f5f5f7]">Aanbieder Toevoegen</h2>
            </div>

            <form onSubmit={handleAddProvider} className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-[#8e8e93] mb-2">Naam</label>
                <input type="text" value={newProvider.name} onChange={(e) => useNewProvider({ ...newProvider, name: e.target.value })} className="w-full px-4 py-2 bg-[#2c2c2e] border border-[#3a3a3c] text-[#f5f5f7] text-[14px] rounded-lg focus:outline-none focus:border-[#636366]" placeholder="Bijv. my_provider" required />
              </div>

              <div>
                <label className="block text-sm text-[#8e8e93] mb-2">Display Naam</label>
                <input type="text" value={newProvider.displayName} onChange={(e) => useNewProvider({ ...newProvider, displayName: e.target.value })} className="w-full px-4 py-2 bg-[#2c2c2e] border border-[#3a3a3c] text-[#f5f5f7] text-[14px] rounded-lg focus:outline-none focus:border-[#636366]" placeholder="Bijv. My Provider" required />
              </div>

              <div>
                <label className="block text-sm text-[#8e8e93] mb-2">API Endpoint</label>
                <input type="url" value={newProvider.baseUrl} onChange={(e) => useNewProvider({ ...newProvider, baseUrl: e.target.value })} className="w-full px-4 py-2 bg-[#2c2c2e] border border-[#3a3a3c] text-[#f5f5f7] text-[14px] rounded-lg focus:outline-none focus:border-[#636366]" placeholder="https://api.example.com" />
              </div>

              <div>
                <label className="block text-sm text-[#8e8e93] mb-2">Auth Type</label>
                <div className="relative">
                  <select value={newProvider.authType} onChange={(e) => useNewProvider({ ...newProvider, authType: e.target.value })} className="w-full px-4 py-2 bg-[#2c2c2e] border border-[#3a3a3c] text-[#f5f5f7] text-[14px] rounded-lg appearance-none focus:outline-none focus:border-[#636366]">
                    <option value="bearer">Bearer Token</option>
                    <option value="x-api-key">X-API-Key</option>
                    <option value="basic">Basic Auth</option>
                    <option value="custom">Custom</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636366] pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#8e8e93] mb-2">Input ($/1M)</label>
                  <input type="number" step="0.01" value={newProvider.inputPricing} onChange={(e) => useNewProvider({ ...newProvider, inputPricing: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2 bg-[#2c2c2e] border border-[#3a3a3c] text-[#f5f5f7] text-[14px] rounded-lg focus:outline-none focus:border-[#636366]" />
                </div>
                <div>
                  <label className="block text-sm text-[#8e8e93] mb-2">Output ($/1M)</label>
                  <input type="number" step="0.01" value={newProvider.outputPricing} onChange={(e) => useNewProvider({ ...newProvider, outputPricing: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2 bg-[#2c2c2e] border border-[#3a3a3c] text-[#f5f5f7] text-[14px] rounded-lg focus:outline-none focus:border-[#636366]" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddProviderModal(false)} className="flex-1 px-4 py-2 bg-[#2c2c2e] hover:bg-[#3a3a3c] text-[#f5f5f7] text-[14px] font-medium rounded-lg transition-colors">Annuleren</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-[#3a3a3c] hover:bg-[#555557] text-[#f5f5f7] text-[14px] font-medium rounded-lg transition-colors">Toevoegen</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
