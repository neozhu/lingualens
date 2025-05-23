"use client"

import { useEffect, useState } from "react"
import { SCENES, Scene } from "@/lib/scenes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from "@/lib/utils"
import { GripVertical, Pencil, Trash2, Plus, Settings, Save, X, WandSparkles } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const LOCAL_KEY = "customScenes"

function getLocalScenes(): Scene[] | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(LOCAL_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function setLocalScenes(scenes: Scene[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(scenes))
}

// Drag and drop sorting component
function SortableItem({ scene, idx, handleEdit, handleDelete }: {
  scene: Scene;
  idx: number;
  handleEdit: (idx: number) => void;
  handleDelete: (idx: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: idx.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "border rounded-lg p-4 relative",
        isDragging && "shadow-xl border-primary"
      )}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span
            className="cursor-grab p-1 text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </span>
          <div className="font-semibold">{scene.name} ({scene.name_en})</div>
        </div>        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleEdit(idx)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(idx)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="text-sm text-muted-foreground mb-1">{scene.description}</div>
      <pre className="bg-muted p-2 rounded text-xs whitespace-pre-wrap">{scene.prompt}</pre>
    </div>
  );
}

// Skeleton component for loading state
function SceneSkeleton() {
  return (
    <div className="border rounded-lg p-4 relative">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-16" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-20 w-full" />
    </div>
  )
}

export default function SceneManagePage() {
  const [scenes, setScenes] = useState<Scene[]>([])
  const [loading, setLoading] = useState(true)
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [form, setForm] = useState<Partial<Scene>>({})
  const [generating, setGenerating] = useState(false)

  // Configure drag sensors, using only pointer (mouse/touch)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px
      },
    })
  );

  useEffect(() => {
    setLoading(true)
    // Add a small delay to simulate loading and show the skeleton effect
    const timer = setTimeout(() => {
      const local = getLocalScenes()
      setScenes(local || SCENES)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const handleEdit = (idx: number) => {
    setEditingIdx(idx)
    setForm(scenes[idx])
  }
  const handleDelete = (idx: number) => {
    const next = scenes.filter((_, i) => i !== idx)
    setScenes(next)
    setLocalScenes(next)
    setEditingIdx(null)
    toast.success("场景已删除")
    setForm({})
  }

  const handleAdd = () => {
    setEditingIdx(-1)
    setForm({ name: "", name_en: "", description: "", prompt: "" })
  }

  const handleChange = (key: keyof Scene, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    if (!form.name || !form.name_en || !form.description || !form.prompt) return

    const newScene = form as Scene
    let newScenes: Scene[]

    if (editingIdx === -1) {
      // Add new scene at the beginning
      newScenes = [newScene, ...scenes]
      toast.success("新场景已添加")
    } else if (editingIdx !== null) {
      // Edit existing scene
      newScenes = scenes.map((scene, i) =>
        i === editingIdx ? newScene : scene
      )
      toast.success("场景已更新")
    } else {
      return
    }

    setScenes(newScenes)
    setLocalScenes(newScenes)
    setEditingIdx(null)
    setForm({})
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      setScenes((prev) => {
        const oldIndex = Number(active.id);
        const newIndex = Number(over.id);

        const newScenes = arrayMove(prev, oldIndex, newIndex);
        setLocalScenes(newScenes);
        toast.success("场景顺序已更新");
        return newScenes;
      });
    }
  }

  const handleGeneratePrompt = async () => {
    // Check if we have the required fields
    if (!form.name_en || !form.description) {
      toast.error("需要填写英文名称和描述才能生成提示词")
      return
    }

    try {
      setGenerating(true)
      toast.info("正在使用 AI 生成提示词...", { duration: 3000 })

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name_en,
          description: form.description
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate prompt: ${response.statusText}`)
      }

      // Get the response as text - now it comes directly as a streamable response
      let responseText = await response.text()
      console.log("Generated prompt raw:", responseText)



      // Handle escaped newlines and clean up the text
      const cleanedText = responseText
        .replace(/\\n/g, '\n')  // Replace escaped newlines with actual newlines
        .replace(/\r\n/g, '\n') // Normalize line endings
        .trim()

      console.log("Final cleaned text for display:", cleanedText)

      // Update the form with the generated prompt
      setForm(prev => ({ ...prev, prompt: cleanedText }))
      toast.success("已成功生成提示词")
    } catch (error) {
      console.error("Error generating prompt:", error)
      toast.error("生成提示词失败，请重试")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">自定义场景管理</h1>
      <p className="mb-6 text-muted-foreground text-sm">
        Manage your custom translation scenes here. You can add, edit, delete, or reorder scenes to tailor the translation experience to your needs. All changes are saved in your browser and can be reset to the default at any time.
      </p>      <div className="mb-4 flex gap-2">
        <Button onClick={handleAdd} variant="outline" title="Add New Scene">
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add New Scene</span>
        </Button>
        <Button variant="outline" onClick={() => {
          setScenes(SCENES)
          setLocalScenes(SCENES)
          setEditingIdx(null)
          toast.success("已重置为默认场景")
          setForm({})
        }} title="Reset to Default">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Reset to Default</span>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <SceneSkeleton key={i} />
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={scenes.map((_, idx) => idx.toString())}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {scenes.map((scene, idx) => (
                <SortableItem
                  key={idx}
                  scene={scene}
                  idx={idx}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                />
              ))}          </div>
          </SortableContext>
        </DndContext>
      )}

      {(editingIdx !== null || form.name) && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-lg shadow-lg relative">
            <Button variant="outline" onClick={() => { setEditingIdx(null); setForm({}) }} title="Cancel" className="absolute top-3 right-3 p-2 h-8 w-8 flex items-center justify-center">
              <X className="h-4 w-4" />
              <span className="sr-only">Cancel</span>
            </Button>
            <h2 className="text-lg font-bold mb-2">{editingIdx !== null ? '编辑场景' : '新增场景'}</h2>
            <div className="space-y-2">              <div>
              <label className="text-xs text-muted-foreground mb-1 block">中文名称</label>
              <Input
                placeholder="输入中文名称"
                value={form.name || ''}
                onChange={e => handleChange('name', e.target.value)}
                className={cn(!form.name && "border-amber-200")}
              />
            </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">英文名称</label>
                <Input
                  placeholder="输入英文名称"
                  value={form.name_en || ''}
                  onChange={e => handleChange('name_en', e.target.value)}
                  className={cn(!form.name_en && "border-amber-200")}
                />
              </div><div className="flex gap-2">
                <div className="flex-grow">
                  <label className="text-xs text-muted-foreground mb-1 block">
                    场景描述 <span className="text-blue-500">(用于生成提示词)</span>
                  </label>
                  <div className="flex items-end gap-2">
                    <Input
                      placeholder="详细描述翻译场景"
                      value={form.description || ''}
                      onChange={e => handleChange('description', e.target.value)}
                      className={cn(!form.description && "border-amber-200")}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleGeneratePrompt}
                      disabled={!form.name_en || !form.description || generating}
                      title="使用 AI 生成提示词"
                      className={cn(
                        "flex-shrink-0 border-dashed mt-0",
                        generating ? "animate-pulse bg-muted" : "hover:border-primary hover:text-primary"
                      )}
                    >

                      <WandSparkles className="h-4 w-4" />
                      <span className="sr-only">使用 AI 生成提示词</span>
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  翻译提示词 {generating && <span className="text-blue-500 animate-pulse">AI 正在生成中...</span>}
                </label>                <Textarea
                  placeholder="输入提示词或点击魔法棒自动生成 (支持 Markdown 格式)"
                  rows={6}
                  value={form.prompt || ''}
                  onChange={e => handleChange('prompt', e.target.value)} className={cn(
                    "font-mono text-sm whitespace-pre-wrap",
                    !form.prompt && "border-amber-200",
                    form.prompt && form.prompt.length > 350 && "border-amber-500"
                  )}
                />
                {form.prompt && (
                  <div className="text-xs text-right mt-1 text-muted-foreground">
                    {form.prompt.length} 字符 {form.prompt.length > 350 &&
                      <span className="text-amber-500">（建议精简到 150-350 字）</span>}
                  </div>
                )}
              </div>
            </div>            
            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="outline"
                onClick={handleSave}
                disabled={!form.name || !form.name_en || !form.description || !form.prompt}
                title="Save"
              >
                <Save className="h-4 w-4" />
                <span className="sr-only">Save</span>
              </Button>
            </div>            {editingIdx === null && (<div className="mt-4">
              <Button
                onClick={handleGeneratePrompt}
                className={cn(
                  "w-full border-dashed",
                  generating ? "bg-muted" : "hover:border-primary hover:text-primary"
                )}
                variant="outline"
                disabled={generating || !form.name_en || !form.description}
                title="使用 AI 生成提示词"
              >
                {generating ? (
                  <>
                    <span className="animate-pulse">AI 正在生成中...</span>
                    <WandSparkles className="h-5 w-5 ml-2 animate-pulse" />
                  </>
                ) : (
                  <>
                    {!form.name_en || !form.description ? (
                      "请先填写英文名称和描述"
                    ) : (
                      "使用 AI 根据名称和描述自动生成提示词"
                    )}
                    <WandSparkles className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
              {(!form.name_en || !form.description) && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  ⚠️ 需要填写英文名称和描述才能使用 AI 生成翻译提示词
                </p>
              )}
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
