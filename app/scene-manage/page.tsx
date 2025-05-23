"use client"

import { useEffect, useState } from "react"
import { SCENES, Scene } from "@/lib/scenes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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

export default function SceneManagePage() {
  const [scenes, setScenes] = useState<Scene[]>([])
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [form, setForm] = useState<Partial<Scene>>({})

  useEffect(() => {
    const local = getLocalScenes()
    setScenes(local || SCENES)
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
  }

  const handleReset = () => {
    setScenes(SCENES)
    setLocalScenes(SCENES)
    setEditingIdx(null)
  }

  const handleChange = (key: keyof Scene, value: string) => {
    setForm({ ...form, [key]: value })
  }

  const handleSave = () => {
    if (!form.name || !form.name_en || !form.description || !form.prompt) return
    let next = [...scenes]
    if (editingIdx !== null && editingIdx >= 0) {
      next[editingIdx] = form as Scene
    } else {
      next.push(form as Scene)
    }
    setScenes(next)
    setLocalScenes(next)
    setEditingIdx(null)
    setForm({})
  }

  const handleAdd = () => {
    setEditingIdx(-1)
    setForm({ name: "", name_en: "", description: "", prompt: "" })
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">自定义场景管理</h1>
      <p className="mb-6 text-muted-foreground text-sm">
        Manage your custom translation scenes here. You can add, edit, or delete scenes to tailor the translation experience to your needs. All changes are saved in your browser and can be reset to the default at any time.
      </p>
      <div className="mb-4 flex gap-2">
        <Button onClick={handleAdd}>新增场景</Button>
        <Button variant="destructive" onClick={handleReset}>重置为默认</Button>
      </div>
      <div className="space-y-4">
        {scenes.map((scene, idx) => (
          <div key={idx} className="border rounded-lg p-4 relative">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">{scene.name} ({scene.name_en})</div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleEdit(idx)}>编辑</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(idx)}>删除</Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-1">{scene.description}</div>
            <pre className="bg-muted p-2 rounded text-xs whitespace-pre-wrap">{scene.prompt}</pre>
          </div>
        ))}
      </div>
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
