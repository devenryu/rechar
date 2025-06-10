"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Download, Share2, Copy, FileImage, FileText, Link, X, Loader2, Check } from "lucide-react"
import { exportElement, generateShareToken } from "@/lib/export-utils"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"

interface ExportShareModalProps {
  isOpen: boolean
  onClose: () => void
  elementRef: React.RefObject<HTMLElement>
  resourceId: string
  resourceType: "chart" | "diagram"
  title: string
}

export default function ExportShareModal({
  isOpen,
  onClose,
  elementRef,
  resourceId,
  resourceType,
  title,
}: ExportShareModalProps) {
  const [exporting, setExporting] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [embedCode, setEmbedCode] = useState("")
  const [allowEmbed, setAllowEmbed] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState("")
  const { user } = useAuth()

  const handleExport = async (format: "png" | "jpeg" | "pdf") => {
    if (!elementRef.current) return

    setExporting(true)
    setError("")

    try {
      await exportElement(elementRef.current, {
        filename: title.replace(/[^a-z0-9]/gi, "_").toLowerCase(),
        format,
      })
    } catch (err) {
      setError("Export failed. Please try again.")
    } finally {
      setExporting(false)
    }
  }

  const handleShare = async () => {
    if (!user) return

    setSharing(true)
    setError("")

    try {
      const shareToken = generateShareToken()

      const { error } = await supabase.from("shared_resources").insert([
        {
          resource_id: resourceId,
          resource_type: resourceType,
          user_id: user.id,
          share_token: shareToken,
          is_public: true,
          allow_embed: allowEmbed,
        },
      ])

      if (error) throw error

      const baseUrl = window.location.origin
      const shareUrl = `${baseUrl}/shared/${shareToken}`
      const embedCode = `<iframe src="${shareUrl}?embed=true" width="800" height="600" frameborder="0"></iframe>`

      setShareUrl(shareUrl)
      setEmbedCode(embedCode)
    } catch (err) {
      setError("Failed to create share link. Please try again.")
    } finally {
      setSharing(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      setError("Failed to copy to clipboard")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <Button variant="ghost" size="sm" className="absolute right-2 top-2" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Export & Share
          </CardTitle>
          <CardDescription>Export your {resourceType} or create a shareable link</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="export" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="export" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </TabsTrigger>
              <TabsTrigger value="share" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </TabsTrigger>
            </TabsList>

            <TabsContent value="export" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Export Options</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleExport("png")}
                    disabled={exporting}
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <FileImage className="w-6 h-6" />
                    <span>PNG</span>
                    <span className="text-xs text-gray-500">High quality</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleExport("jpeg")}
                    disabled={exporting}
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <FileImage className="w-6 h-6" />
                    <span>JPEG</span>
                    <span className="text-xs text-gray-500">Smaller size</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleExport("pdf")}
                    disabled={exporting}
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <FileText className="w-6 h-6" />
                    <span>PDF</span>
                    <span className="text-xs text-gray-500">Document</span>
                  </Button>
                </div>

                {exporting && (
                  <div className="flex items-center justify-center mt-4 text-green-600">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="share" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Share Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allow-embed">Allow Embedding</Label>
                      <p className="text-sm text-gray-500">
                        Allow others to embed this {resourceType} on their websites
                      </p>
                    </div>
                    <Switch id="allow-embed" checked={allowEmbed} onCheckedChange={setAllowEmbed} />
                  </div>
                </div>
              </div>

              {!shareUrl ? (
                <Button onClick={handleShare} disabled={sharing} className="w-full bg-green-600 hover:bg-green-700">
                  {sharing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Share Link...
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4 mr-2" />
                      Create Share Link
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="share-url">Share URL</Label>
                    <div className="flex gap-2 mt-1">
                      <Input id="share-url" value={shareUrl} readOnly className="flex-1" />
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(shareUrl, "url")}>
                        {copied === "url" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Anyone with this link can view your {resourceType}</p>
                  </div>

                  {allowEmbed && (
                    <div>
                      <Label htmlFor="embed-code">Embed Code</Label>
                      <div className="flex gap-2 mt-1">
                        <textarea
                          id="embed-code"
                          value={embedCode}
                          readOnly
                          className="flex-1 min-h-[80px] px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                        />
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(embedCode, "embed")}>
                          {copied === "embed" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Copy this code to embed the {resourceType} on your website
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
