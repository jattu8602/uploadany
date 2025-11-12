'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface TextEditorProps {
  id: string
  title: string
  content: string
  onTitleChange: (id: string, title: string) => void
  onContentChange: (id: string, content: string) => void
  onRemove: (id: string) => void
}

export default function TextEditor({
  id,
  title,
  content,
  onTitleChange,
  onContentChange,
  onRemove,
}: TextEditorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const editor = useEditor({
    extensions: [StarterKit],
    content: content || '<p>Start typing...</p>',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onContentChange(id, html)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
      },
    },
  })

  if (!mounted) {
    return (
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Text box title..."
            value={title}
            onChange={(e) => onTitleChange(id, e.target.value)}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(id)}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="border rounded-md min-h-[200px] p-4">
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="glass-card p-5 space-y-4 border-2 border-white/20 shadow-colorful hover:border-white/40 transition-all duration-300">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Text box title..."
          value={title}
          onChange={(e) => onTitleChange(id, e.target.value)}
          className="flex-1 bg-white/50 border-2 border-white/30 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(id)}
          className="text-destructive hover:bg-destructive/20 hover:text-destructive transition-colors"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="border-2 border-white/30 rounded-lg min-h-[200px] bg-white/30 backdrop-blur-sm">
        <EditorContent editor={editor} />
      </div>
    </Card>
  )
}

