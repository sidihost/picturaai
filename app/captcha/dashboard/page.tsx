'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Plus, Copy, Check, Trash2, Globe, Key, BarChart3, Settings,
  Shield, ExternalLink, RefreshCw, AlertCircle, CheckCircle2,
  Eye, EyeOff
} from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'
import { toast } from 'sonner'

interface Site {
  id: string
  domain: string
  site_key: string
  secret_key: string
  verified: boolean
  created_at: string
  challenges_solved: number
  challenges_failed: number
}

interface Developer {
  id: string
  name: string
  email: string
  signupMethod?: string
}

export default function CaptchaDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [developer, setDeveloper] = useState<Developer | null>(null)
  const [sites, setSites] = useState<Site[]>([])
  const [activeTab, setActiveTab] = useState<'sites' | 'analytics' | 'settings'>('sites')
  const [showAddSite, setShowAddSite] = useState(false)
  const [newDomain, setNewDomain] = useState('')
  const [addingDomain, setAddingDomain] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [showSecretFor, setShowSecretFor] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const getAuthHeaders = (): HeadersInit => {
    const localToken = localStorage.getItem('pictura_session')
    const headers: HeadersInit = {}
    if (localToken) {
      headers['Authorization'] = `Bearer ${localToken}`
    }
    return headers
  }
  
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/developers/auth/me', {
        credentials: 'include',
        headers: getAuthHeaders()
      })
      if (res.ok) {
        const data = await res.json()
        setDeveloper(data.developer)
        fetchSites()
      } else {
        window.location.href = '/captcha/login'
      }
    } catch {
      window.location.href = '/captcha/login'
    } finally {
      setLoading(false)
    }
  }

  const fetchSites = async () => {
    try {
      const res = await fetch('/api/captcha/sites', {
        credentials: 'include',
        headers: getAuthHeaders()
      })
      if (res.ok) {
        const data = await res.json()
        setSites(data.sites || [])
        // Set developer signup method from the API response
        if (data.signupMethod) {
          setDeveloper(prev => prev ? { ...prev, signupMethod: data.signupMethod } : null)
        }
      }
    } catch (error) {
      console.error('Failed to fetch sites:', error)
    }
  }

  const addSite = async () => {
    if (!newDomain.trim()) {
      toast.error('Please enter a domain')
      return
    }

    // Basic domain validation
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
    const cleanDomain = newDomain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase()
    
    if (!domainRegex.test(cleanDomain) && cleanDomain !== 'localhost') {
      toast.error('Please enter a valid domain (e.g., example.com)')
      return
    }

    setAddingDomain(true)
    try {
      const res = await fetch('/api/captcha/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify({ domain: cleanDomain })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setSites([data.site, ...sites])
        setNewDomain('')
        setShowAddSite(false)
        toast.success('Site added successfully!')
      } else {
        toast.error(data.error || 'Failed to add site')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setAddingDomain(false)
    }
  }

  const deleteSite = async (siteId: string) => {
    if (!confirm('Are you sure you want to delete this site? This cannot be undone.')) return

    try {
      const res = await fetch(`/api/captcha/sites/${siteId}`, { method: 'DELETE' })
      if (res.ok) {
        setSites(sites.filter(s => s.id !== siteId))
        toast.success('Site deleted')
      } else {
        toast.error('Failed to delete site')
      }
    } catch {
      toast.error('Something went wrong')
    }
  }

  const copyToClipboard = (text: string, keyType: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(keyType)
    setTimeout(() => setCopiedKey(null), 2000)
    toast.success('Copied to clipboard')
  }

  const totalChallenges = sites.reduce((sum, s) => sum + (s.challenges_solved || 0) + (s.challenges_failed || 0), 0)
  const totalSolved = sites.reduce((sum, s) => sum + (s.challenges_solved || 0), 0)
  const successRate = totalChallenges > 0 ? Math.round((totalSolved / totalChallenges) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 sm:pt-24 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <PicturaIcon size={28} />
              <h1 className="text-xl sm:text-2xl font-bold"><span className="text-[#C87941]">Pictura</span><span className="text-foreground">CAPTCHA</span></h1>
            </div>
            <p className="text-sm text-muted-foreground">Manage your sites and view analytics</p>
          </div>
          <Link
            href="/captcha/docs"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Documentation
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit mb-6">
          {[
            { id: 'sites', label: 'Sites', icon: Globe },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Sites Tab */}
        {activeTab === 'sites' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Add Site Button */}
            <button
              onClick={() => setShowAddSite(true)}
              className="mb-6 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              Add Site
            </button>

            {/* Add Site Modal */}
            {showAddSite && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-xl"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">Add New Site</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter the domain where you'll use PicturaCAPTCHA. CAPTCHA will only work on this domain.
                  </p>
                  <input
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="example.com"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    autoFocus
                  />
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowAddSite(false)}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addSite}
                      disabled={addingDomain}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {addingDomain ? 'Adding...' : 'Add Site'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Sites List */}
            {sites.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-xl">
                <Globe className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <h3 className="font-medium text-foreground mb-1">No sites yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Add your first site to get started</p>
                <button
                  onClick={() => setShowAddSite(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Add Site
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sites.map((site) => (
                  <div
                    key={site.id}
                    className="border border-border rounded-xl p-4 sm:p-5 bg-card"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Globe className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{site.domain}</h3>
                            {site.verified ? (
                              <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="h-3 w-3" />
                                Active
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                                <AlertCircle className="h-3 w-3" />
                                Pending
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Added {new Date(site.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteSite(site.id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors p-2 -m-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Keys */}
                    <div className="mt-4 grid sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Key className="h-3 w-3" />
                            Site Key
                          </span>
                          <button
                            onClick={() => copyToClipboard(site.site_key, `site-${site.id}`)}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            {copiedKey === `site-${site.id}` ? (
                              <Check className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                        <code className="text-xs text-foreground font-mono break-all">{site.site_key}</code>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Secret Key
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setShowSecretFor(showSecretFor === site.id ? null : site.id)}
                              className="text-muted-foreground hover:text-primary transition-colors"
                              title={showSecretFor === site.id ? 'Hide secret key' : 'Show secret key'}
                            >
                              {showSecretFor === site.id ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => copyToClipboard(site.secret_key, `secret-${site.id}`)}
                              className="text-muted-foreground hover:text-primary transition-colors"
                              title="Copy secret key"
                            >
                              {copiedKey === `secret-${site.id}` ? (
                                <Check className="h-3.5 w-3.5 text-primary" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                        <code className="text-xs text-foreground font-mono break-all">
                          {showSecretFor === site.id ? site.secret_key : '••••••••••••••••••••'}
                        </code>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-4 flex gap-4 text-xs">
                      <span className="text-muted-foreground">
                        <span className="font-medium text-foreground">{site.challenges_solved || 0}</span> solved
                      </span>
                      <span className="text-muted-foreground">
                        <span className="font-medium text-foreground">{site.challenges_failed || 0}</span> failed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div className="p-5 rounded-xl border border-border bg-card">
                <p className="text-sm text-muted-foreground mb-1">Total Challenges</p>
                <p className="text-2xl font-bold text-foreground">{totalChallenges.toLocaleString()}</p>
              </div>
              <div className="p-5 rounded-xl border border-border bg-card">
                <p className="text-sm text-muted-foreground mb-1">Solved</p>
                <p className="text-2xl font-bold text-primary">{totalSolved.toLocaleString()}</p>
              </div>
              <div className="p-5 rounded-xl border border-border bg-card">
                <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
                <p className="text-2xl font-bold text-foreground">{successRate}%</p>
              </div>
            </div>

            {sites.length > 0 && (
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Site</th>
                      <th className="text-right py-3 px-4 font-semibold text-foreground">Solved</th>
                      <th className="text-right py-3 px-4 font-semibold text-foreground">Failed</th>
                      <th className="text-right py-3 px-4 font-semibold text-foreground">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sites.map((site) => {
                      const total = (site.challenges_solved || 0) + (site.challenges_failed || 0)
                      const rate = total > 0 ? Math.round(((site.challenges_solved || 0) / total) * 100) : 0
                      return (
                        <tr key={site.id}>
                          <td className="py-3 px-4 font-medium text-foreground">{site.domain}</td>
                          <td className="py-3 px-4 text-right text-muted-foreground">{site.challenges_solved || 0}</td>
                          <td className="py-3 px-4 text-right text-muted-foreground">{site.challenges_failed || 0}</td>
                          <td className="py-3 px-4 text-right text-primary font-medium">{rate}%</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-xl"
          >
            <div className="p-5 rounded-xl border border-border bg-card mb-4">
              <h3 className="font-semibold text-foreground mb-1">Account</h3>
              <p className="text-sm text-muted-foreground mb-4">Your Pictura developer account details</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Name</label>
                  <p className="text-sm font-medium text-foreground">{developer?.name}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Email</label>
                  <p className="text-sm font-medium text-foreground">{developer?.email}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Sign up Method</label>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {developer?.signupMethod === 'pictura' ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="text-primary">🔐</span> Signed up with Pictura
                      </span>
                    ) : (
                      developer?.signupMethod || 'Pictura'
                    )}
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/developers/dashboard"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              Go to Image API Dashboard
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        )}
      </div>
      
      <Footer />
    </div>
  )
}
