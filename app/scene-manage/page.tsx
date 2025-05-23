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
import { GripVertical } from "lucide-react"
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
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleEdit(idx)}>编辑</Button>
          <Button size="sm" variant="destructive" onClick={() => handleDelete(idx)}>删除</Button>
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

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">自定义场景管理</h1>
      <p className="mb-6 text-muted-foreground text-sm">
        Manage your custom translation scenes here. You can add, edit, delete, or reorder scenes to tailor the translation experience to your needs. All changes are saved in your browser and can be reset to the default at any time.
      </p>      <div className="mb-4 flex gap-2">
        <Button onClick={handleAdd}>新增场景</Button>
        <Button variant="destructive" onClick={() => {
          setScenes(SCENES)
          setLocalScenes(SCENES)
          setEditingIdx(null)
          toast.success("已重置为默认场景")
          setForm({})
        }}>重置为默认</Button>
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
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-lg shadow-lg">
            <h2 className="text-lg font-bold mb-2">{editingIdx !== null ? '编辑场景' : '新增场景'}</h2>
            <div className="space-y-2">
              <Input placeholder="中文名称" value={form.name || ''} onChange={e => handleChange('name', e.target.value)} />
              <Input placeholder="英文名称" value={form.name_en || ''} onChange={e => handleChange('name_en', e.target.value)} />
              <Input placeholder="描述" value={form.description || ''} onChange={e => handleChange('description', e.target.value)} />
              <Textarea placeholder="Prompt" rows={4} value={form.prompt || ''} onChange={e => handleChange('prompt', e.target.value)} />
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <Button onClick={() => { setEditingIdx(null); setForm({}) }}>取消</Button>
              <Button onClick={handleSave} disabled={!form.name || !form.name_en || !form.description || !form.prompt}>保存</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
