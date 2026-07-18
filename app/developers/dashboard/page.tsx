'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Book,
  ChevronDown,
  Loader2,
  Menu,
  X,
  Activity,
  ArrowUpRight,
  Shield,
  Wallet,
  Lock,
  User,
  DollarSign,
  Gift,
  Sparkles,
  Rocket,
  Zap,
  Crown,
  Eye,
  EyeOff,
} from 'lucide-react'
import { PicturaLogo, PicturaIcon } from '@/components/pictura/pictura-logo'
import { PatternAvatar } from '@/components/pictura/pattern-avatar'

interface ApiKey {
  id: string
  name: string
  keyPreview: string
  secret_key?: string // Full API key for display
  createdAt: string
  lastUsed: string | null
  requestsCount: number
  isActive: boolean
}

interface Developer {
  id: string
  email: string
  name: string
  creditsBalance: number
  currency: string
  tier: string
  createdAt: string
  lastLogin: string
  apiKeys: ApiKey[]
  usage: {
    thisMonth: number
    lastMonth: number
    totalRequests: number
  }
  transactions: {
    id: string
    type: string
    amount: number
    description: string
    balanceAfter: number
    createdAt: string
  }[]
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦', USD: '$', GBP: '£', EUR: '€', CAD: 'C$',
  AUD: 'A$', INR: '₹', ZAR: 'R', KES: 'KSh', GHS: 'GH₵',
  JPY: '¥', BRL: 'R$',
}

export default function DeveloperDashboard() {
  const [developer, setDeveloper] = useState<Developer | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'api-keys' | 'usage' | 'billing' | 'settings' | 'playground'>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // API Key creation
  const [showCreateKey, setShowCreateKey] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [creatingKey, setCreatingKey] = useState(false)
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)
  const [showSecretFor, setShowSecretFor] = useState<string | null>(null) // Track which key is revealed
  
  // Delete confirmation
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null)
  const [deletingKey, setDeletingKey] = useState(false)
  
  // Onboarding
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  
  // Pricing & Payment
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{name: string, credits: number, price: number} | null>(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [editableName, setEditableName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [pendingPaymentUrl, setPendingPaymentUrl] = useState<string | null>(null)
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  const fetchDashboard = useCallback(async () => {
    try {
      const localToken = localStorage.getItem('pictura_session')
      
      const headers: HeadersInit = {}
      if (localToken) {
        headers['Authorization'] = `Bearer ${localToken}`
      }
      
      const res = await fetch('/api/developers/dashboard', {
        credentials: 'include',
        headers,
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        if (res.status === 401) {
          localStorage.removeItem('pictura_session')
          localStorage.removeItem('pictura_developer')
          window.location.href = '/developers/login'
          return
        }
        toast.error(errorData.error || 'Failed to load dashboard')
        return
      }

      const data = await res.json()
      setDeveloper(data)
      
      const hasSeenOnboarding = localStorage.getItem('pictura_onboarding_complete')
      if (!hasSeenOnboarding && data.apiKeys?.length <= 1) {
        setShowOnboarding(true)
      }
    } catch {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  useEffect(() => {
    if (developer?.name) setEditableName(developer.name)
  }, [developer?.name])

  useEffect(() => {
    const paymentState = new URLSearchParams(window.location.search).get('payment')
    const pendingUrl = localStorage.getItem('pictura_pending_payment_url')
    if (pendingUrl) setPendingPaymentUrl(pendingUrl)

    if (paymentState === 'success') {
      localStorage.removeItem('pictura_pending_payment_url')
      setPendingPaymentUrl(null)
      toast.success('Payment successful! Credits will reflect shortly.')
    } else if (paymentState === 'cancel' || paymentState === 'cancelled') {
      toast.info('Payment pending. You can continue from your saved payment link.')
    }
  }, [])

  const handleUpdateName = async () => {
    if (!editableName.trim() || !developer || editableName.trim() === developer.name) return
    setSavingName(true)
    try {
      const token = localStorage.getItem('pictura_session')
      const res = await fetch('/api/developers/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name: editableName.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || 'Failed to update name')
        return
      }
      toast.success('Profile updated')
      fetchDashboard()
    } catch {
      toast.error('Failed to update name')
    } finally {
      setSavingName(false)
    }
  }

  const handleLogout = async () => {
    try {
      const localToken = localStorage.getItem('pictura_session')
      const headers: HeadersInit = {}
      if (localToken) headers['Authorization'] = `Bearer ${localToken}`
      
      await fetch('/api/developers/auth/logout', {
        method: 'POST',
        headers,
        credentials: 'include',
      })
    } finally {
      localStorage.removeItem('pictura_session')
      localStorage.removeItem('pictura_developer')
      window.location.href = '/developers/login'
    }
  }


  const handleDeleteAccount = async () => {
    setDeletingAccount(true)
    try {
      const localToken = localStorage.getItem('pictura_session')
      const res = await fetch('/api/developers/profile', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          ...(localToken ? { Authorization: `Bearer ${localToken}` } : {}),
        },
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || 'Failed to delete account')
        return
      }

      toast.success('Account deleted successfully')
      localStorage.removeItem('pictura_session')
      localStorage.removeItem('pictura_developer')
      localStorage.removeItem('pictura_pending_payment_url')
      window.location.href = '/developers/login'
    } catch {
      toast.error('Failed to delete account')
    } finally {
      setDeletingAccount(false)
      setShowDeleteAccountDialog(false)
    }
  }

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for your API key')
      return
    }

    setCreatingKey(true)
    try {
      const localToken = localStorage.getItem('pictura_session')
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (localToken) headers['Authorization'] = `Bearer ${localToken}`
      
      const res = await fetch('/api/developers/api-keys', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ name: newKeyName.trim() }),
      })

      const data = await res.json()

      if (res.ok && data.key) {
        setNewlyCreatedKey(data.key)
        toast.success('API key created! Save it now - it won\'t be shown again.')
        fetchDashboard()
      } else {
        toast.error(data.error || 'Failed to create API key')
      }
    } catch {
      toast.error('Failed to create API key')
    } finally {
      setCreatingKey(false)
    }
  }

  const handleDeleteKey = async () => {
    if (!keyToDelete) return

    setDeletingKey(true)
    try {
      const localToken = localStorage.getItem('pictura_session')
      const headers: HeadersInit = {}
      if (localToken) headers['Authorization'] = `Bearer ${localToken}`
      
      const res = await fetch(`/api/developers/api-keys?id=${keyToDelete.id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      })

      if (res.ok) {
        toast.success('API key deleted')
        fetchDashboard()
        setKeyToDelete(null)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete API key')
      }
    } catch {
      toast.error('Failed to delete API key')
    } finally {
      setDeletingKey(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedKey(false), 2000)
  }

  const completeOnboarding = () => {
    localStorage.setItem('pictura_onboarding_complete', 'true')
    setShowOnboarding(false)
  }

  const formatCurrency = (amount: number) => {
    const symbol = developer ? CURRENCY_SYMBOLS[developer.currency] || '$' : '$'
    return `${symbol}${amount.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const profileInitial = (developer?.name || developer?.email || 'D').charAt(0).toUpperCase()
  const avgDailyUsage = developer ? Math.max(1, Math.round(developer.usage.thisMonth / Math.max(new Date().getDate(), 1))) : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-4">
          <PicturaIcon size={48} className="animate-pulse" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!developer) return null

  const navItems: Array<{
    id: 'overview' | 'api-keys' | 'usage' | 'billing' | 'settings' | 'playground'
    label: string
    icon: typeof BarChart3
    comingSoon?: boolean
  }> = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'usage', label: 'Usage', icon: Activity },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'playground', label: 'Playground', icon: Rocket, comingSoon: true },
  ]

  const panelCardClass = 'border border-[#E8D8C8] bg-[#FFFCF8] rounded-2xl shadow-[0_8px_28px_rgba(120,79,42,0.06)]'
  const metricCardClass = 'border border-[#EEDFCC] bg-gradient-to-b from-[#FFFDF9] to-[#F9F1E8] rounded-2xl shadow-[0_6px_20px_rgba(120,79,42,0.05)]'
  const primaryButtonClass = 'bg-[#C87941] hover:bg-[#B86D35] text-white'

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#FDF9F4_0%,#FAF3EB_100%)] overflow-x-hidden [&_[data-slot=card]]:shadow-none">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#FFFCF8]/95 backdrop-blur-md border-b border-[#EADBCB]">
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="w-10 h-10 rounded-2xl border border-[#E5D2BE] bg-gradient-to-br from-[#FFF9F2] to-[#F5E8D9] hover:from-[#FDF1E3] hover:to-[#EFDCC7] shadow-sm hover:shadow flex items-center justify-center transition-all active:scale-95 text-[#7A573A]"
        >
          <Menu className="h-4 w-4" />
        </button>
        <Link href="/" className="transition-opacity hover:opacity-80"><PicturaLogo size="sm" /></Link>
        <button onClick={() => setActiveTab('settings')} className="active:scale-95 transition-transform">
          <PatternAvatar name={developer.name || 'Developer'} email={developer.email} size="sm" />
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)} 
        />
        <div 
          className={`fixed inset-y-0 left-0 w-[286px] bg-[#FFFCF8] border-r border-[#EADBCB] transform transition-transform duration-300 ease-out flex flex-col ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#C87941]/10 to-transparent">
            <Link href="/" className="transition-opacity hover:opacity-80" onClick={() => setSidebarOpen(false)}><PicturaLogo size="sm" /></Link>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="w-8 h-8 rounded-full bg-muted/80 hover:bg-muted flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
            <p className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Menu</p>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.comingSoon) {
                    toast.info('Playground is coming soon')
                    return
                  }
                  setActiveTab(item.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-[#C87941] to-[#B96A34] text-white font-medium border border-[#B96A34]'
                    : 'text-[#7A5B42] hover:bg-[#F5E9DC] active:scale-[0.98]'
                } ${item.comingSoon ? 'opacity-75' : ''}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.comingSoon ? (
                  <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full bg-[#F8E4CE] text-[#9A6334] border border-[#E5C7A7]">Soon</span>
                ) : activeTab === item.id ? (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                ) : null}
              </button>
            ))}
          </nav>

          {/* Quick Links */}
          <div className="px-3 py-2 border-t">
            <p className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Resources</p>
            <Link
              href="/api-docs"
              target="_blank"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              <Book className="h-4 w-4" />
              Documentation
              <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
            </Link>
            <Link
              href="/developers/support"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              <Shield className="h-4 w-4" />
              Support
            </Link>
          </div>

          {/* Sign Out */}
          <div className="p-4 border-t border-[#EADBCB] bg-[#FCF5EC]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm text-[#A34232] bg-gradient-to-r from-[#FDF1EE] to-[#FCE6E2] hover:from-[#FBE7E2] hover:to-[#F7D8D1] transition-colors font-semibold border border-[#F1C8BE]"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="flex lg:items-stretch">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-72 min-h-screen bg-[#F8F1E8] border-r border-[#E4D5C5]">
          <div className="p-5 border-b border-[#E4D5C5] bg-gradient-to-r from-[#F4E5D4] to-[#F8F1E8]">
            <Link href="/" className="inline-flex transition-opacity hover:opacity-80"><PicturaIcon className="w-9 h-9" /></Link>
            <span className="text-sm font-semibold text-[#6E4D32] mt-2 block">Developer Dashboard</span>
          </div>
          
          <nav className="flex-1 p-4 space-y-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.comingSoon) {
                    toast.info('Playground is coming soon')
                    return
                  }
                  setActiveTab(item.id)
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-[#C87941] to-[#B66933] text-white font-medium border border-[#B96A34]'
                    : 'text-[#6F5239] hover:bg-[#F0E2D3]'
                } ${item.comingSoon ? 'opacity-80' : ''}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.comingSoon && <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full bg-[#F8E4CE] text-[#9A6334] border border-[#E5C7A7]">Soon</span>}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-[#E4D5C5]">
            <Link
              href="/api-docs"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#6F5239] hover:bg-[#F1E4D6] transition-colors"
            >
              <Book className="h-4 w-4" />
              Documentation
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Link>
          </div>

          <div className="p-4 border-t border-[#E4D5C5]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#EFE0D2] transition-colors border border-[#E9D9C9] bg-[#FFF9F2]">
                  <PatternAvatar name={developer.name || 'Developer'} email={developer.email} size="md" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">{developer.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{developer.email}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('billing')}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Pricing
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/api-docs" target="_blank">
                    <Book className="h-4 w-4 mr-2" />
                    Documentation
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Credits</span>
                  <span className="text-sm font-medium">{formatCurrency(developer.creditsBalance)}</span>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl overflow-x-hidden bg-[radial-gradient(circle_at_top,_#FFF6EA,_transparent_60%)]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#EDDCC8] bg-[#FFF9F2] px-4 py-3">
                <h1 className="text-lg sm:text-xl font-semibold text-[#3F2B1D]">Welcome back, {developer.name?.split(' ')[0]}</h1>
                <p className="text-sm text-[#7A614B]">Here's what's happening with your API</p>
              </div>

              {/* Stats Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* ATM Card Design - Brand Color */}
                <Card className="col-span-full sm:col-span-2 md:col-span-1 overflow-hidden relative border-0" style={{ background: 'linear-gradient(135deg, #C87941 0%, #A65D2E 52%, #8B4D26 100%)' }}>
                  {/* Contactless icon */}
                  <div className="absolute top-4 right-4">
                    <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8.5 14.5c2-2 5-2 7 0M6 12c3.5-3.5 8.5-3.5 12 0M3.5 9.5c5-5 12-5 17 0" strokeLinecap="round"/>
                    </svg>
                  </div>
                  
                  <CardContent className="p-5 pt-5 relative text-white">
                    <div className="mb-4">
                      <p className="text-[10px] uppercase tracking-wider text-white/70 mb-1">Available Credits</p>
                      <div className="text-2xl sm:text-3xl font-semibold tracking-tight">{formatCurrency(developer.creditsBalance)}</div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-white/50 mb-0.5">Account</p>
                        <p className="text-xs font-medium tracking-wide truncate max-w-[140px]">{developer.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-wider text-white/50 mb-0.5">Plan</p>
                        <p className="text-xs font-medium">{developer.tier?.toUpperCase() || 'FREE'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={metricCardClass}>
                  <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                    <CardDescription className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Activity className="h-3.5 w-3.5" />
                      This Month
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 px-3 sm:px-4">
                    <div className="text-xl sm:text-2xl font-semibold text-gray-900">{developer.usage.thisMonth.toLocaleString()}</div>
                    {developer.usage.lastMonth > 0 && (
                      <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-0.5">
                        <ArrowUpRight className="h-2.5 w-2.5" />
                        <span>
                          {Math.round(((developer.usage.thisMonth - developer.usage.lastMonth) / developer.usage.lastMonth) * 100)}%
                        </span>
                        vs last month
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className={metricCardClass}>
                  <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                    <CardDescription className="flex items-center gap-1.5 text-xs text-gray-500">
                      <BarChart3 className="h-3.5 w-3.5" />
                      Total Requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 px-3 sm:px-4">
                    <div className="text-xl sm:text-2xl font-semibold text-gray-900">{developer.usage.totalRequests.toLocaleString()}</div>
                    <p className="text-[10px] text-gray-500 mt-0.5">All time</p>
                  </CardContent>
                </Card>

                <Card className={metricCardClass}>
                  <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                    <CardDescription className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Key className="h-3.5 w-3.5" />
                      API Keys
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 px-3 sm:px-4">
                    <div className="text-xl sm:text-2xl font-semibold text-gray-900">{developer.apiKeys.filter(k => k.isActive).length}</div>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {developer.apiKeys.length} total
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid gap-3 sm:grid-cols-2">
                <Card className="cursor-pointer hover:bg-[#F7E9DB] transition-colors group border border-[#E9D8C5] bg-[#FFFCF8] rounded-2xl" onClick={() => setActiveTab('api-keys')}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors shrink-0">
                      <Key className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-gray-900">API Keys</h3>
                      <p className="text-xs text-gray-500 truncate">Create and manage keys</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-[#F7E9DB] transition-colors group border border-[#E9D8C5] bg-[#FFFCF8] rounded-2xl" onClick={() => window.open('/api-docs', '_blank')}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors shrink-0">
                      <Book className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-gray-900">Documentation</h3>
                      <p className="text-xs text-gray-500 truncate">API reference & guides</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions */}
              {developer.transactions && developer.transactions.length > 0 && (
                <Card className={metricCardClass}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm sm:text-base text-gray-900">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {developer.transactions.slice(0, 5).map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${tx.amount > 0 ? 'bg-[#F5E4D5]' : 'bg-gray-100'}`}>
                              {tx.type === 'signup_bonus' || tx.type === 'promo' ? (
                                <Gift className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${tx.amount > 0 ? 'text-[#A65D2E]' : 'text-gray-500'}`} />
                              ) : (
                                <DollarSign className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${tx.amount > 0 ? 'text-[#A65D2E]' : 'text-gray-500'}`} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{tx.description}</p>
                              <p className="text-[10px] sm:text-xs text-gray-500">{formatDate(tx.createdAt)}</p>
                            </div>
                          </div>
                          <div className={`text-xs sm:text-sm font-medium shrink-0 ${tx.amount > 0 ? 'text-[#A65D2E]' : 'text-gray-500'}`}>
                            {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === 'api-keys' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#E8D8C8] bg-gradient-to-r from-[#FFF8EF] via-[#FFFDF9] to-[#FFF7EC] p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2 text-[#3F2B1D]">
                      API Keys
                      <Badge className="text-[10px] bg-[#FFE9D2] text-[#8F5829] border border-[#E3BE95]">Beta</Badge>
                    </h1>
                    <p className="text-xs sm:text-sm text-[#7C624B] mt-1">
                      Manage your API keys for Pictura API access.
                    </p>
                  </div>
                  <Button onClick={() => { setShowCreateKey(true); setNewKeyName(''); setNewlyCreatedKey(null) }} className={`${primaryButtonClass} text-sm h-10 px-5 rounded-xl`}>
                    <Plus className="h-4 w-4 mr-1.5" />
                    New Key
                  </Button>
                </div>
              </div>

              <Card className={`${panelCardClass} overflow-hidden`}>
                <CardContent className="p-0">
                  {developer.apiKeys.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-muted rounded-lg m-4">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Key className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium mb-1">No API keys added</h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">Create your first API key to start using the Pictura API</p>
                      <Button onClick={() => { setShowCreateKey(true); setNewKeyName(''); setNewlyCreatedKey(null) }} variant="outline">
                        New Key
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {developer.apiKeys.map((key) => (
                        <div key={key.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 hover:bg-[#FBF2E9] transition-colors gap-2 sm:gap-4 border-b border-[#F0E3D5] last:border-b-0">
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${key.isActive ? 'bg-[#F8E9D9]' : 'bg-[#F3EFE9]'}`}>
                              <Key className={`h-4 w-4 sm:h-5 sm:w-5 ${key.isActive ? 'text-[#A76635]' : 'text-[#9B8B79]'}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-sm sm:text-base truncate">{key.name}</p>
                                {!key.isActive && <Badge variant="secondary" className="text-[10px] sm:text-xs">Inactive</Badge>}
                              </div>
                              <code className="text-xs sm:text-sm text-[#7C6A58] font-mono block truncate">
                                {showSecretFor === key.id && key.secret_key ? key.secret_key : key.keyPreview}
                              </code>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-2 pl-11 sm:pl-0">
                            <p className="text-[10px] sm:text-xs text-[#8A7461]">
                              {key.requestsCount.toLocaleString()} requests
                            </p>
                            <div className="flex items-center gap-1">
                              {/* Reveal/Hide button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowSecretFor(showSecretFor === key.id ? null : key.id)}
                                className="text-[#8A7461] hover:text-[#A76635] hover:bg-[#F7EBDD] h-8 w-8 p-0 rounded-lg"
                                title={showSecretFor === key.id ? 'Hide key' : 'Reveal key'}
                              >
                                {showSecretFor === key.id ? (
                                  <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(key.secret_key || key.keyPreview)}
                                className="text-[#8A7461] hover:text-[#A76635] hover:bg-[#F7EBDD] h-8 w-8 p-0 rounded-lg"
                              >
                                <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setKeyToDelete(key)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                              >
                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-[#E5C7A7] bg-gradient-to-br from-[#FFF7EC] to-[#FFF2E3] rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 border-b border-[#F1DDC8] bg-[#FFF9F1]">
                    <div className="w-10 h-10 rounded-xl bg-[#F8E4CE] flex items-center justify-center shrink-0">
                      <Shield className="h-5 w-5 text-[#A65D2E]" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-[#704826]">Keep your API keys secure</p>
                      <p className="text-sm text-[#8E6442]">Treat your API key like a password. Rotate keys regularly and keep them private.</p>
                    </div>
                  </div>
                  <div className="px-4 sm:px-5 py-3 sm:py-4 grid gap-2 text-sm text-[#825D3D]">
                    <p>• Never expose keys in frontend code or public repositories.</p>
                    <p>• Use separate keys for production and staging environments.</p>
                    <p>• Delete compromised keys immediately and issue a new one.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Usage Tab */}
          {activeTab === 'usage' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h1 className="text-lg sm:text-xl font-semibold">Usage</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Monitor your API usage and requests</p>
              </div>

              <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className={metricCardClass}>
                  <CardHeader className="pb-1.5 pt-3 px-3 sm:px-4">
                    <CardDescription className="text-xs">This Month</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 px-3 sm:px-4">
                    <div className="text-xl sm:text-2xl font-bold">{developer.usage.thisMonth.toLocaleString()}</div>
                    <p className="text-[10px] sm:text-xs text-[#8A7461]">requests</p>
                  </CardContent>
                </Card>

                <Card className={metricCardClass}>
                  <CardHeader className="pb-1.5 pt-3 px-3 sm:px-4">
                    <CardDescription className="text-xs">Last Month</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 px-3 sm:px-4">
                    <div className="text-xl sm:text-2xl font-bold">{developer.usage.lastMonth.toLocaleString()}</div>
                    <p className="text-[10px] sm:text-xs text-[#8A7461]">requests</p>
                  </CardContent>
                </Card>

                <Card className={metricCardClass}>
                  <CardHeader className="pb-1.5 pt-3 px-3 sm:px-4">
                    <CardDescription className="text-xs">All Time</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 px-3 sm:px-4">
                    <div className="text-xl sm:text-2xl font-bold">{developer.usage.totalRequests.toLocaleString()}</div>
                    <p className="text-[10px] sm:text-xs text-[#8A7461]">requests</p>
                  </CardContent>
                </Card>

                <Card className={metricCardClass}>
                  <CardHeader className="pb-1.5 pt-3 px-3 sm:px-4">
                    <CardDescription className="text-xs">Avg / Day</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 px-3 sm:px-4">
                    <div className="text-xl sm:text-2xl font-bold">{avgDailyUsage.toLocaleString()}</div>
                    <p className="text-[10px] sm:text-xs text-[#8A7461]">requests/day</p>
                  </CardContent>
                </Card>
              </div>

              <Card className={panelCardClass}>
                <CardHeader>
                  <CardTitle className="text-lg text-[#6B4A2C]">Usage by API Key</CardTitle>
                </CardHeader>
                <CardContent>
                  {developer.apiKeys.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No API keys yet</p>
                  ) : (
                    <div className="space-y-4">
                      {developer.apiKeys.map((key) => (
                        <div key={key.id} className="flex items-center justify-between py-2 px-3 rounded-lg border border-[#F0E4D6] bg-white/80">
                          <div className="flex items-center gap-3">
                            <Key className="h-4 w-4 text-[#A56B3B]" />
                            <span className="text-sm font-medium">{key.name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {key.requestsCount.toLocaleString()} requests
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h1 className="text-lg sm:text-xl font-semibold">Billing</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Manage your credits and payment methods</p>
              </div>

              {pendingPaymentUrl && (
                <Card className="border border-[#E3BE95] bg-[#FFF5E8] rounded-2xl">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#7B4E28]">Payment Pending</p>
                      <p className="text-xs text-[#9A6B45]">Your previous checkout was not completed. Continue payment anytime.</p>
                    </div>
                    <Button onClick={() => window.location.href = pendingPaymentUrl} className={`${primaryButtonClass} h-8 text-xs`}>Continue Payment</Button>
                  </CardContent>
                </Card>
              )}

              <Card className={panelCardClass}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm sm:text-base text-[#6B4A2C]">Current Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 border border-[#EBD9C5] rounded-lg bg-[#FFF8EF]">
                    <div>
                      <h3 className="text-sm font-semibold">{developer.tier === 'free' ? 'Free Plan' : 'Premium Plan'}</h3>
                      <p className="text-xs text-muted-foreground">Pay as you go pricing</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs h-8 border-[#DDB892] text-[#8E5A2D]" onClick={() => setShowPricingModal(true)}>View Plans</Button>
                      <Button size="sm" className={`${primaryButtonClass} text-xs h-8`} onClick={() => setShowPricingModal(true)}>Upgrade</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={panelCardClass}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm sm:text-base text-[#6B4A2C]">Credit Balance</CardTitle>
                  <CardDescription className="text-xs">Your credits are used for API calls.</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Premium ATM Card Design - Brand Color */}
                  <div className="relative overflow-hidden rounded-lg aspect-[1.6/1] max-w-md" style={{ background: 'linear-gradient(135deg, #C87941 0%, #A65D2E 50%, #8B4D26 100%)' }}>
                    {/* Chip */}
                    <div className="absolute top-6 left-6 w-12 h-9 rounded-lg bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400 opacity-90">
                      <div className="absolute inset-1 grid grid-cols-3 gap-0.5">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="bg-yellow-400/50 rounded-sm" />
                        ))}
                      </div>
                    </div>
                    {/* Contactless */}
                    <div className="absolute top-6 right-6">
                      <svg className="w-8 h-8 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M8.5 14.5c2-2 5-2 7 0M6 12c3.5-3.5 8.5-3.5 12 0M3.5 9.5c5-5 12-5 17 0" strokeLinecap="round"/>
                      </svg>
                    </div>
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                          <pattern id="billingGrid" width="8" height="8" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="0.5" fill="white"/>
                          </pattern>
                        </defs>
                        <rect width="100" height="100" fill="url(#billingGrid)"/>
                      </svg>
                    </div>
                    {/* Holographic strip */}
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    
                    {/* Card content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="mb-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 mb-1">Available Balance</p>
                        <div className="text-3xl sm:text-4xl font-bold tracking-tight">{formatCurrency(developer.creditsBalance)}</div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[8px] uppercase tracking-wider text-white/60 mb-0.5">Card Holder</p>
                          <p className="text-sm font-medium tracking-wide">{developer.name?.toUpperCase()}</p>
                        </div>
                        <div className="flex gap-1">
                          <div className="w-7 h-7 rounded-full bg-white/30" />
                          <div className="w-7 h-7 rounded-full bg-white/20 -ml-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => setShowPricingModal(true)} className={`mt-4 text-sm h-9 ${primaryButtonClass}`}>Buy Credits</Button>
                </CardContent>
              </Card>

              {developer.transactions && developer.transactions.length > 0 && (
                <Card className={panelCardClass}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm sm:text-base text-[#6B4A2C]">Transaction History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y">
                      {developer.transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between py-2.5 sm:py-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium truncate">{tx.description}</p>
                            <p className="text-[10px] sm:text-xs text-[#8A7461]">{formatDate(tx.createdAt)}</p>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <div className={`text-xs sm:text-sm font-medium ${tx.amount > 0 ? 'text-[#C87941]' : 'text-muted-foreground'}`}>
                              {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                            </div>
                            <p className="text-[10px] sm:text-xs text-[#8A7461]">Bal: {formatCurrency(tx.balanceAfter)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Playground Tab */}
          {activeTab === 'playground' && (
            <div className="space-y-6">
              <Card className="border border-[#E8D8C8] bg-gradient-to-br from-[#FFF8EF] to-[#FFFDF9] rounded-2xl">
                <CardContent className="p-8 text-center">
                  <Sparkles className="h-10 w-10 mx-auto text-[#C87941] mb-3" />
                  <h2 className="text-xl font-semibold text-[#4A321F]">Playground is coming soon</h2>
                  <p className="text-sm text-[#7A614B] mt-2 max-w-md mx-auto">We’re building an interactive playground to test prompts, inspect responses, and experiment faster.</p>
                  <Badge className="mt-4 bg-[#F8E4CE] text-[#8F5829] border border-[#E3BE95]">Coming Soon</Badge>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h1 className="text-lg sm:text-xl font-semibold">Settings</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Manage your account settings</p>
              </div>

              {/* Profile Card with Brand Color Background */}
              <Card className={`${panelCardClass} overflow-hidden`}>
                <div className="h-20 sm:h-24 bg-gradient-to-br from-[#C87941] via-[#A65D2E] to-[#8B4D26] relative">
                  <div className="absolute inset-0 opacity-15">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <pattern id="settingsGrid" width="8" height="8" patternUnits="userSpaceOnUse">
                          <circle cx="1" cy="1" r="0.5" fill="white"/>
                        </pattern>
                      </defs>
                      <rect width="100" height="100" fill="url(#settingsGrid)"/>
                    </svg>
                  </div>
                </div>
                <CardContent className="relative pt-0">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 sm:-mt-12">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-background overflow-hidden">
                      <div className="absolute inset-0 bg-[conic-gradient(from_220deg,#C87941,#B56732,#8B4D26,#C87941)] animate-[spin_9s_linear_infinite]" />
                      <div className="absolute inset-[3px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#D4935F,#B66A34_58%,#7A3E1D)]" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,.35),transparent_45%)]" />
                      <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-semibold tracking-tight">
                        {profileInitial}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <h3 className="font-semibold text-base sm:text-lg truncate">{developer.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{developer.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="text-[10px] bg-[#FFF1E2] text-[#9B6332] border border-[#E2C19D]">
                        {developer.tier?.toUpperCase() || 'FREE'} TIER
                      </Badge>
                      <Button variant="outline" size="sm" className="text-xs h-8 border-[#DDB892] text-[#8E5A2D]" onClick={() => setShowPricingModal(true)}>
                        Upgrade
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Details */}
              <Card className={panelCardClass}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-[#C87941]" />
                    Account Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Full Name</Label>
                      <Input value={editableName} onChange={(e) => setEditableName(e.target.value)} className="mt-1 text-sm border-[#E8D8C9] bg-[#FFFCF8]" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Email Address</Label>
                      <Input value={developer.email} disabled className="mt-1 text-sm border-[#E8D8C9] bg-[#FFFCF8]" />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleUpdateName} disabled={savingName || !editableName.trim() || editableName.trim() === developer.name} className={`${primaryButtonClass} h-8 text-xs`}>
                      {savingName ? 'Saving...' : 'Save Profile'}
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Account Created</Label>
                      <Input value={formatDate(developer.createdAt)} disabled className="mt-1 text-sm border-[#E8D8C9] bg-[#FFFCF8]" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Currency</Label>
                      <Input value={developer.currency} disabled className="mt-1 text-sm border-[#E8D8C9] bg-[#FFFCF8]" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Credits Balance</Label>
                      <Input value={formatCurrency(developer.creditsBalance)} disabled className="mt-1 text-sm font-medium text-[#A65D2E] border-[#E8D8C9] bg-[#FFFCF8]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                <Card className="bg-[#FFF4E7] border-[#E7C7A7]">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <Key className="h-5 w-5 mx-auto text-[#C87941] mb-1" />
                    <p className="text-lg sm:text-xl font-bold">{developer.apiKeys.filter(k => k.isActive).length}</p>
                    <p className="text-[10px] text-muted-foreground">Active Keys</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#FFF4E7] border-[#E7C7A7]">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <Activity className="h-5 w-5 mx-auto text-[#C87941] mb-1" />
                    <p className="text-lg sm:text-xl font-bold">{developer.usage.thisMonth.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">This Month</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#FFF4E7] border-[#E7C7A7]">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <BarChart3 className="h-5 w-5 mx-auto text-[#C87941] mb-1" />
                    <p className="text-lg sm:text-xl font-bold">{developer.usage.totalRequests.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">Total Requests</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#FFF4E7] border-[#E7C7A7]">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <CreditCard className="h-5 w-5 mx-auto text-[#C87941] mb-1" />
                    <p className="text-lg sm:text-xl font-bold">{developer.transactions?.length || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Transactions</p>
                  </CardContent>
                </Card>
              </div>

              {/* Danger Zone */}
              <Card className="border-[#E8CFC2] bg-[#FFF9F6]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm sm:text-base text-[#B55E3E] flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 border border-[#E8CFC2] rounded-lg bg-[#FFF4ED]">
                    <div>
                      <h4 className="font-medium text-sm text-[#B55E3E]">Delete Account</h4>
                      <p className="text-xs text-muted-foreground">Permanently delete your account and all associated data</p>
                    </div>
                    <Button variant="destructive" size="sm" className="text-xs shrink-0" onClick={() => setShowDeleteAccountDialog(true)}>Delete Account</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Create API Key Dialog */}
      <Dialog open={showCreateKey} onOpenChange={setShowCreateKey}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{newlyCreatedKey ? 'API Key Created' : 'Create API Key'}</DialogTitle>
            <DialogDescription>
              {newlyCreatedKey 
                ? 'Save this key securely. It will not be shown again.'
                : 'Give your API key a name to help you identify it later.'
              }
            </DialogDescription>
          </DialogHeader>

          {newlyCreatedKey ? (
            <div className="space-y-4">
              <div className="p-4 bg-[#C87941]/10 border border-[#C87941]/30 rounded-lg">
                <Label className="text-[#C87941]">Your API Key</Label>
                <div className="flex items-center gap-2 mt-2">
                  <code className="flex-1 p-3 bg-white border rounded text-xs sm:text-sm font-mono break-all">{newlyCreatedKey}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(newlyCreatedKey)}
                  >
                    {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => { setShowCreateKey(false); setNewlyCreatedKey(null) }} className={primaryButtonClass}>
                  Done
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production, Development"
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateKey(false)}>Cancel</Button>
                <Button onClick={handleCreateKey} disabled={creatingKey} className={primaryButtonClass}>
                  {creatingKey ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Key
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Key Confirmation Dialog */}
      <Dialog open={!!keyToDelete} onOpenChange={() => setKeyToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{keyToDelete?.name}"? This action cannot be undone and any applications using this key will stop working.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKeyToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteKey} disabled={deletingKey}>
              {deletingKey ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <Dialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This will permanently disable your API keys, clear active sessions, and anonymize your developer profile. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteAccountDialog(false)} disabled={deletingAccount}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={deletingAccount}>
              {deletingAccount ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Onboarding Dialog */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="sm:max-w-lg">
          {onboardingStep === 0 && (
            <>
              <DialogHeader>
                <div className="flex justify-center mb-4">
                  <PicturaIcon size={64} />
                </div>
                <DialogTitle className="text-center text-xl">Welcome to Pictura Developer Portal!</DialogTitle>
                <DialogDescription className="text-center">
                  You're all set to start generating images with our AI-powered API. Let's show you around.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center">
                <Button onClick={() => setOnboardingStep(1)} className={primaryButtonClass}>
                  Get Started
                </Button>
              </DialogFooter>
            </>
          )}

          {onboardingStep === 1 && (
            <>
              <DialogHeader>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-lg bg-[#C87941]/10 flex items-center justify-center">
                    <Key className="h-8 w-8 text-[#C87941]" />
                  </div>
                </div>
                <DialogTitle className="text-center text-xl">Your API Key is Ready</DialogTitle>
                <DialogDescription className="text-center">
                  We've created your first API key automatically. You can manage your keys and create new ones from the API Keys section.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center gap-2">
                <Button variant="outline" onClick={() => setOnboardingStep(0)}>Back</Button>
                <Button onClick={() => setOnboardingStep(2)} className={primaryButtonClass}>
                  Next
                </Button>
              </DialogFooter>
            </>
          )}

          {onboardingStep === 2 && (
            <>
              <DialogHeader>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-lg bg-[#C87941]/10 flex items-center justify-center">
                    <Gift className="h-8 w-8 text-[#C87941]" />
                  </div>
                </div>
                <DialogTitle className="text-center text-xl">Free Credits to Start</DialogTitle>
                <DialogDescription className="text-center">
                  You have free credits to start building! Each API call costs a small amount of credits. Check your balance in the Billing section.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center gap-2">
                <Button variant="outline" onClick={() => setOnboardingStep(1)}>Back</Button>
                <Button onClick={completeOnboarding} className={primaryButtonClass}>
                  Start Building
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Pricing Modal */}
      <Dialog open={showPricingModal} onOpenChange={setShowPricingModal}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          {/* Header with brand gradient */}
          <div className="bg-gradient-to-r from-[#C87941] to-[#A65D2E] p-4 text-white">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Buy Credits
            </DialogTitle>
            <p className="text-white/80 text-xs mt-0.5">Choose a package. Credits never expire.</p>
          </div>
          
          <div className="p-4 space-y-2 max-h-[50vh] overflow-y-auto">
            {[
              { name: 'Starter', credits: 1000, price: 500, popular: false },
              { name: 'Growth', credits: 5000, price: 2000, popular: true },
              { name: 'Pro', credits: 15000, price: 5000, popular: false },
              { name: 'Business', credits: 50000, price: 15000, popular: false },
              { name: 'Enterprise', credits: 150000, price: 40000, popular: false },
              { name: 'Custom', credits: 500000, price: 100000, popular: false },
            ].map((plan) => (
              <div
                key={plan.name}
                onClick={() => setSelectedPlan(plan)}
                className={`relative flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedPlan?.name === plan.name 
                ? 'border-[#C87941] bg-[#C87941]/5' 
                    : 'border-border hover:border-[#C87941]/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    selectedPlan?.name === plan.name 
                      ? 'bg-[#C87941] text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {plan.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{plan.name}</span>
                      {plan.popular && (
                        <span className="px-1.5 py-0.5 bg-[#C87941] text-white text-[9px] font-medium rounded">Best</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{plan.credits.toLocaleString()} credits</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#C87941]">
                    {CURRENCY_SYMBOLS[developer.currency] || '₦'}{plan.price.toLocaleString()}
                  </span>
                  {selectedPlan?.name === plan.name && (
                    <Check className="h-4 w-4 text-[#C87941]" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 pt-0 space-y-3">
            <Button 
              onClick={async () => {
                if (!selectedPlan || !developer) return
                setProcessingPayment(true)
                try {
                  const res = await fetch('/api/paystack/initialize', {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('pictura_session')}`
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                      amount: selectedPlan.price,
                      credits: selectedPlan.credits,
                      planName: selectedPlan.name,
                      email: developer.email,
                      name: developer.name,
                    }),
                  })
                  const data = await res.json()
                  if (data.success && data.authorizationUrl) {
                    localStorage.setItem('pictura_pending_payment_url', data.authorizationUrl)
                    setPendingPaymentUrl(data.authorizationUrl)
                    window.location.href = data.authorizationUrl
                  } else {
                    toast.error(data.error || 'Payment initialization failed')
                  }
                } catch {
                  toast.error('An error occurred')
                } finally {
                  setProcessingPayment(false)
                }
              }}
              disabled={!selectedPlan || processingPayment}
              className={`w-full h-10 ${primaryButtonClass}`}
            >
              {processingPayment ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : selectedPlan ? (
                <>
                  <Lock className="h-3.5 w-3.5 mr-2" />
                  Pay {CURRENCY_SYMBOLS[developer.currency] || '₦'}{selectedPlan.price.toLocaleString()}
                </>
              ) : (
                'Select a Package'
              )}
            </Button>
            <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" />
              Secure payment powered by Paystack
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
