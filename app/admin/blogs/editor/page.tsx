"use client"

import type React from "react"

import { useRef, useState, useEffect, useCallback } from "react"
import {
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  ImageIcon,
  Send,
  X,
  Link,
  Code,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { usePublishBlog } from "@/hooks/usePublishBlog"
import { useUpdateBlog } from "@/hooks/useUpdateBlog"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface ActiveStates {
  bold: boolean
  italic: boolean
  underline: boolean
  strikethrough: boolean
  h1: boolean
  h2: boolean
  ul: boolean
  ol: boolean
  quote: boolean
  justifyLeft: boolean
  justifyCenter: boolean
  justifyRight: boolean
}

export default function BlogCreationPage() {
  const router = useRouter()
  const publishBlog = usePublishBlog()
  const updateBlog = useUpdateBlog()
  const searchParams = useSearchParams()
  const editingId = searchParams?.get('id')
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [activeStates, setActiveStates] = useState<ActiveStates>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    h1: false,
    h2: false,
    ul: false,
    ol: false,
    quote: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
  })
  const [linkUrl, setLinkUrl] = useState("")
  const [showLinkPopover, setShowLinkPopover] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const updateActiveStates = useCallback(() => {
    if (!editorRef.current) return

    const newActiveStates: ActiveStates = {
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikethrough: document.queryCommandState("strikeThrough"),
      h1: document.queryCommandValue("formatBlock") === "h1",
      h2: document.queryCommandValue("formatBlock") === "h2",
      ul: document.queryCommandState("insertUnorderedList"),
      ol: document.queryCommandState("insertOrderedList"),
      quote: document.queryCommandValue("formatBlock") === "blockquote",
      justifyLeft: document.queryCommandState("justifyLeft"),
      justifyCenter: document.queryCommandState("justifyCenter"),
      justifyRight: document.queryCommandState("justifyRight"),
    }

    setActiveStates(newActiveStates)
  }, [])

  const formatText = (format: string, value?: string) => {
    if (!editorRef.current) return

    editorRef.current.focus()

    switch (format) {
      case "bold":
        document.execCommand("bold", false)
        break
      case "italic":
        document.execCommand("italic", false)
        break
      case "underline":
        document.execCommand("underline", false)
        break
      case "strikethrough":
        document.execCommand("strikeThrough", false)
        break
      case "h1":
        document.execCommand("formatBlock", false, "<h1>")
        break
      case "h2":
        document.execCommand("formatBlock", false, "<h2>")
        break
      case "ul":
        document.execCommand("insertUnorderedList", false)
        break
      case "ol":
        document.execCommand("insertOrderedList", false)
        break
      case "quote":
        document.execCommand("formatBlock", false, "<blockquote>")
        break
      case "link":
        if (value) {
          document.execCommand("createLink", false, value)
          setShowLinkPopover(false)
          setLinkUrl("")
        }
        break
      case "code":
        document.execCommand("formatBlock", false, "<code>")
        break
      case "hr":
        document.execCommand("insertHorizontalRule", false)
        break
      case "justifyLeft":
        document.execCommand("justifyLeft", false)
        break
      case "justifyCenter":
        document.execCommand("justifyCenter", false)
        break
      case "justifyRight":
        document.execCommand("justifyRight", false)
        break
      case "foreColor":
        if (value) {
          document.execCommand("foreColor", false, value)
        }
        break
      default:
        break
    }

    setTimeout(updateActiveStates, 10)
  }

  const insertLink = () => {
    if (linkUrl) {
      formatText("link", linkUrl)
    }
  }

  const colors = [
    "#000000",
    "#374151",
    "#dc2626",
    "#ea580c",
    "#d97706",
    "#65a30d",
    "#059669",
    "#0891b2",
    "#2563eb",
    "#7c3aed",
    "#c026d3",
  ]

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = ""
      editorRef.current.focus()

      const handleSelectionChange = () => {
        updateActiveStates()
      }

      const handleKeyUp = () => {
        updateActiveStates()
      }

      const handleMouseUp = () => {
        updateActiveStates()
      }

      document.addEventListener("selectionchange", handleSelectionChange)
      editorRef.current.addEventListener("keyup", handleKeyUp)
      editorRef.current.addEventListener("mouseup", handleMouseUp)

      return () => {
        document.removeEventListener("selectionchange", handleSelectionChange)
        if (editorRef.current) {
          editorRef.current.removeEventListener("keyup", handleKeyUp)
          editorRef.current.removeEventListener("mouseup", handleMouseUp)
        }
      }
    }
  }, [updateActiveStates])

  // Load blog data when editing
  useEffect(() => {
    if (!editingId) return

    const load = async () => {
      try {
        const res = await fetch(`/api/blogs/${editingId}`)
        if (!res.ok) throw new Error('Failed to load blog')
        const data = await res.json()
        setTitle(data.title)
        setCategory(data.category)
        setTags(data.tags || [])
        if (editorRef.current) editorRef.current.innerHTML = data.content
      } catch (e) {
        toast.error('Failed to load blog for editing')
      }
    }

    load()
  }, [editingId])

  const handleCreateBlog = async () => {
    if (!title || !category || !editorRef.current?.innerHTML) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      if (editingId) {
        await updateBlog.mutateAsync({
          id: editingId,
          title,
          content: editorRef.current.innerHTML,
          category,
          tags,
        })
      } else {
        await publishBlog.mutateAsync({
          title,
          content: editorRef.current.innerHTML,
          category,
          tags,
        })
      }

      router.push("/admin/blogs")
    } catch (error) {
      // handled by hooks
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 md:mb-8">
          <Button variant="ghost" className="text-gray-600 hover:text-gray-900 justify-start sm:justify-start" onClick={() => router.push("/admin/blogs")}>
            <ArrowLeft className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">Back to Blogs</span>
          </Button>
          <Button 
            className="bg-gray-900 text-white hover:bg-gray-700 w-full sm:w-auto"
            onClick={handleCreateBlog}
            disabled={publishBlog.isLoading || updateBlog.isLoading}
            size="sm"
          >
            {publishBlog.isLoading || updateBlog.isLoading ? (
              editingId ? 'Updating...' : 'Saving...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{editingId ? 'Update Blog' : 'Create Blog'}</span>
              </>
            )}
          </Button>
        </div>

        {/* Title */}
        <div className="mb-4 md:mb-6">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="border-0 border-b border-gray-200 rounded-none px-0 text-xl sm:text-2xl md:text-3xl font-bold placeholder:text-gray-300 focus-visible:ring-0 focus-visible:border-gray-400"
          />
        </div>

        {/* Category and Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="border-gray-200 text-sm">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="programming">Programming</SelectItem>
                <SelectItem value="tutorials">Tutorials</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="career">Career</SelectItem>
                <SelectItem value="lifestyle">Lifestyle</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="opinion">Opinion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">Tags</label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag"
                className="border-gray-200 text-sm"
              />
              <Button onClick={addTag} variant="outline" className="border-gray-200 text-xs sm:text-sm px-3">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs">
                    {tag}
                    <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Editor Toolbar - Scrollable on Mobile */}
        <div className="bg-gray-50 rounded-t-lg border border-gray-200 border-b-0 overflow-x-auto">
          <div className="flex items-center gap-0.5 p-2 flex-nowrap min-w-max md:flex-wrap md:min-w-0">
            {/* Text Formatting */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText("bold")}
              className={`text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0 h-8 w-8 p-0 ${activeStates.bold ? "bg-gray-200 text-gray-900" : ""}`}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText("italic")}
              className={`text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0 h-8 w-8 p-0 ${activeStates.italic ? "bg-gray-200 text-gray-900" : ""}`}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText("underline")}
              className={`text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0 h-8 w-8 p-0 ${activeStates.underline ? "bg-gray-200 text-gray-900" : ""}`}
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText("strikethrough")}
              className={`text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0 h-8 w-8 p-0 ${activeStates.strikethrough ? "bg-gray-200 text-gray-900" : ""}`}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 bg-gray-300 mx-0.5 flex-shrink-0" />

            {/* Headings */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText("h1")}
              className={`text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0 h-8 w-8 p-0 ${activeStates.h1 ? "bg-gray-200 text-gray-900" : ""}`}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText("h2")}
              className={`text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0 h-8 w-8 p-0 ${activeStates.h2 ? "bg-gray-200 text-gray-900" : ""}`}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 bg-gray-300 mx-0.5 flex-shrink-0" />

            {/* Lists */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText("ul")}
              className={`text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0 h-8 w-8 p-0 ${activeStates.ul ? "bg-gray-200 text-gray-900" : ""}`}
              title="Unordered List"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText("ol")}
              className={`text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0 h-8 w-8 p-0 ${activeStates.ol ? "bg-gray-200 text-gray-900" : ""}`}
              title="Ordered List"
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText("quote")}
              className={`text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0 h-8 w-8 p-0 ${activeStates.quote ? "bg-gray-200 text-gray-900" : ""}`}
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 bg-gray-300 mx-0.5 flex-shrink-0" />

            {/* Alignment */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText("justifyLeft")}
              className={`text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0 h-8 w-8 p-0 ${activeStates.justifyLeft ? "bg-gray-200 text-gray-900" : ""}`}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText("justifyCenter")}
              className={`text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0 h-8 w-8 p-0 ${activeStates.justifyCenter ? "bg-gray-200 text-gray-900" : ""}`}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText("justifyRight")}
              className={`text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0 h-8 w-8 p-0 ${activeStates.justifyRight ? "bg-gray-200 text-gray-900" : ""}`}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 bg-gray-300 mx-0.5 flex-shrink-0" />

            {/* Link */}
            <Popover open={showLinkPopover} onOpenChange={setShowLinkPopover}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0 h-8 w-8 p-0" title="Insert Link">
                  <Link className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter URL"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && insertLink()}
                    className="text-sm"
                  />
                  <Button onClick={insertLink} size="sm">
                    Add
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Color */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0 h-8 w-8 p-0" title="Text Color">
                  <Palette className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="grid grid-cols-6 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded border border-gray-200 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => formatText("foreColor", color)}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Other Tools */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText("code")}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0 h-8 w-8 p-0"
              title="Code"
            >
              <Code className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText("hr")}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0 h-8 w-8 p-0"
              title="Horizontal Line"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0 h-8 w-8 p-0" title="Insert Image">
              <ImageIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content Area - WYSIWYG Editor */}
        <div className="bg-white rounded-b-lg border border-gray-200 min-h-[300px] sm:min-h-[400px]">
          <div
            ref={editorRef}
            contentEditable
            className="p-3 sm:p-4 min-h-[300px] sm:min-h-[400px] focus:outline-none prose prose-sm sm:prose max-w-none text-sm sm:text-base"
            onFocus={(e) => {
              if (e.currentTarget.textContent === "") {
                e.currentTarget.dataset.empty = "true"
              } else {
                delete e.currentTarget.dataset.empty
              }
            }}
            onBlur={(e) => {
              if (e.currentTarget.textContent === "") {
                e.currentTarget.dataset.empty = "true"
              } else {
                delete e.currentTarget.dataset.empty
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
