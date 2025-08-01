"use client";

import { useEffect, useState } from "react";
import { SCENES, Scene } from "@/lib/scenes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useChat } from "@ai-sdk/react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import {
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  Settings,
  Save,
  X,
  WandSparkles,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

const LOCAL_KEY = "customScenes";

function getLocalScenes(): Scene[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalScenes(scenes: Scene[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(scenes));
}

// Drag and drop sorting component
function SortableItem({
  scene,
  idx,
  handleEdit,
  handleDelete,
  animationDelay = 0,
}: {
  scene: Scene;
  idx: number;
  handleEdit: (idx: number) => void;
  handleDelete: (idx: number) => void;
  animationDelay?: number;
}) {
  const locale = useLocale();

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
      style={{
        ...style,
        animationDelay: `${animationDelay}ms`,
      }}
      className={cn(
        "border rounded-lg p-4 relative animate-in fade-in slide-in-from-bottom-4 duration-500",
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
          <div className="font-semibold">
            {" "}
            {locale === "en" ? scene.name_en : scene.name}
          </div>
        </div>{" "}
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleEdit(idx)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => handleDelete(idx)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="text-sm text-muted-foreground mb-1">
        {scene.description}
      </div>
      <pre className="bg-muted p-2 rounded text-xs whitespace-pre-wrap">
        {scene.prompt}
      </pre>
    </div>
  );
}



export default function SceneManagePage() {
  const t = useTranslations("sceneManage");

  const [scenes, setScenes] = useState<Scene[]>(() => {
    // Initialize with data immediately to avoid loading state
    const local = getLocalScenes();
    return local || SCENES;
  });
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Scene>>({});
  const [generating, setGenerating] = useState(false);
  // Use useChat hook to handle API communication
  const { messages, append } = useChat({
    api: "/api/generate",
    initialMessages: [], // Explicitly set empty initial messages
    onFinish: (message: { content: string }) => {
      // Update form prompt field when generation is complete
      setForm((prev) => ({ ...prev, prompt: message.content }));
      setGenerating(false);
      toast.success(t("promptGeneratedSuccess"));
    },
    onError: (error: Error) => {
      console.error("Error generating prompt:", error);
      setGenerating(false);
      toast.error(t("promptGenerationFailed"));
    },
  });

  // Configure drag sensors, using only pointer (mouse/touch)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px
      },
    })
  ); // Listen for message list changes to get the latest assistant reply
  useEffect(() => {
    const assistantMessage = messages
      .filter((m: { role: string; content: string }) => m.role === "assistant")
      .pop();
    if (assistantMessage?.content && !generating) {
      setForm((prev) => ({ ...prev, prompt: assistantMessage.content }));
    }
  }, [messages, generating]);

  // Data is now initialized directly in useState, no need for loading effect

  const handleEdit = (idx: number) => {
    setEditingIdx(idx);
    setForm(scenes[idx]);
  };
  const handleDelete = (idx: number) => {
    const next = scenes.filter((_, i) => i !== idx);
    setScenes(next);
    setLocalScenes(next);
    setEditingIdx(null);
    toast.success(t("sceneDeleted"));
    setForm({});
  };

  const handleAdd = () => {
    setEditingIdx(-1);
    setForm({ name: "", name_en: "", description: "", prompt: "" });
  };

  const handleChange = (key: keyof Scene, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!form.name || !form.name_en || !form.description || !form.prompt)
      return;

    const newScene = form as Scene;
    let newScenes: Scene[];

    if (editingIdx === -1) {
      // Add new scene at the beginning
      newScenes = [newScene, ...scenes];
      toast.success(t("newSceneAdded"));
    } else if (editingIdx !== null) {
      // Edit existing scene
      newScenes = scenes.map((scene, i) =>
        i === editingIdx ? newScene : scene
      );
      toast.success(t("sceneUpdated"));
    } else {
      return;
    }

    setScenes(newScenes);
    setLocalScenes(newScenes);
    setEditingIdx(null);
    setForm({});
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      setScenes((prev) => {
        const oldIndex = Number(active.id);
        const newIndex = Number(over.id);

        const newScenes = arrayMove(prev, oldIndex, newIndex);
        setLocalScenes(newScenes);
        toast.success(t("sceneOrderUpdated"));
        return newScenes;
      });
    }
  };
  const handleGeneratePrompt = async () => {
    // Check if we have the required fields
    if (!form.name_en || !form.description) {
      toast.error(t("needNameDescForPrompt"));
      return;
    }

    setGenerating(true);
    toast.info(t("aiGeneratingPrompt"), { duration: 3000 });

    // Fix: Create a message with empty content, but provide the data in the options
    const userPrompt = `
Scene Name: ${form.name_en}
Description: ${form.description}

Please create a translation prompt for the above scene that will guide an AI model in performing high-quality bidirectional translation. Format the prompt using Markdown with headings, and bullet points as appropriate.
`;
    await append({
      role: 'user',
      content: userPrompt
    })

  };
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
      <p className="mb-6 text-muted-foreground text-sm">
        {t("description")}
      </p>{" "}
      <div className="mb-4 flex gap-2">
        <Button onClick={handleAdd} variant="outline" title={t("addScene")}>
          <Plus className="h-4 w-4" />
          <span className="sr-only">{t("addScene")}</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setScenes(SCENES);
            setLocalScenes(SCENES);
            setEditingIdx(null);
            toast.success(t("resetToDefaultDone"));
            setForm({});
          }}
          title={t("resetToDefault")}
        >
          <Settings className="h-4 w-4" />
          <span className="sr-only">{t("resetToDefault")}</span>
        </Button>
      </div>
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
                animationDelay={idx * 100}
              />
            ))}{" "}
          </div>
        </SortableContext>
      </DndContext>
      {(editingIdx !== null || form.name) && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-lg shadow-lg relative">
            <Button
              variant="outline"
              onClick={() => {
                setEditingIdx(null);
                setForm({});
              }}
              title={t("common.cancel")}
              className="absolute top-3 right-3 p-2 h-8 w-8 flex items-center justify-center"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">{t("common.cancel")}</span>
            </Button>
            <h2 className="text-lg font-bold mb-2">
              {editingIdx !== -1 ? t("editScene") : t("newScene")}
            </h2>
            <div className="space-y-2">
              {" "}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  {t("name")}
                </label>
                <Input
                  placeholder={t("name")}
                  value={form.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={cn(!form.name && "border-amber-200")}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  {t("englishName")}
                </label>
                <Input
                  placeholder={t("englishName")}
                  value={form.name_en || ""}
                  onChange={(e) => handleChange("name_en", e.target.value)}
                  className={cn(!form.name_en && "border-amber-200")}
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-grow">
                  <label className="text-xs text-muted-foreground mb-1 block">
                    {t("sceneDescription")}{" "}
                    <span className="text-blue-500">
                      {t("descriptionForPrompt")}
                    </span>
                  </label>{" "}
                  <div className="flex items-end gap-2">
                    <Input
                      placeholder={t("sceneDescription")}
                      value={form.description || ""}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                      className={cn(!form.description && "border-amber-200")}
                    />{" "}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleGeneratePrompt}
                      disabled={
                        !form.name_en || !form.description || generating
                      }
                      title={t("generatePrompt")}
                      className={cn(
                        "flex-shrink-0 border-dashed mt-0",
                        generating
                          ? "animate-pulse bg-muted"
                          : "hover:border-primary hover:text-primary"
                      )}
                    >
                      <WandSparkles className="h-4 w-4" />
                      <span className="sr-only">{t("generatePrompt")}</span>
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                {" "}
                <label className="text-xs text-muted-foreground mb-1 block">
                  {t("translationPrompt")}{" "}
                  {(generating) && (
                    <span className="text-blue-500 animate-pulse">
                      {t("aiGenerating")}
                    </span>
                  )}
                </label>
                <Textarea
                  placeholder={t("promptPlaceholder")}
                  rows={6}
                  value={form.prompt || ""}
                  onChange={(e) => handleChange("prompt", e.target.value)}
                  className={cn(
                    "font-mono text-sm whitespace-pre-wrap",
                    !form.prompt && "border-amber-200",
                    form.prompt &&
                    form.prompt.length > 400 &&
                    "border-amber-500"
                  )}
                />{" "}
                {form.prompt && (
                  <div className="text-xs text-right mt-1 text-muted-foreground">
                    {form.prompt.length} {t("characters")}{" "}
                    {form.prompt.length > 400 && (
                      <span className="text-amber-500">
                        {t("lengthSuggestion")}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={
                  !form.name ||
                  !form.name_en ||
                  !form.description ||
                  !form.prompt
                }
                title={t("common.save")}
              >
                <Save className="h-4 w-4" />
                <span className="sr-only">{t("common.save")}</span>
              </Button>
            </div>{" "}
            {editingIdx === null && (
              <div className="mt-4">
                {" "}
                <Button
                  onClick={handleGeneratePrompt}
                  className={cn(
                    "w-full border-dashed",
                    generating
                      ? "bg-muted"
                      : "hover:border-primary hover:text-primary"
                  )}
                  variant="outline"
                  disabled={
                    generating ||
                    !form.name_en ||
                    !form.description
                  }
                  title={t("generatePrompt")}
                >
                  {" "}
                  {generating ? (
                    <>
                      <span className="animate-pulse">{t("aiGenerating")}</span>
                      <WandSparkles className="h-5 w-5 ml-2 animate-pulse" />
                    </>
                  ) : (
                    <>
                      {!form.name_en || !form.description
                        ? t("fillNameDescription")
                        : t("generatePrompt")}
                      <WandSparkles className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>{" "}
                {(!form.name_en || !form.description) && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    ⚠️ {t("nameDescriptionRequired")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
