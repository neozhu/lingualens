"use client"

import { useState, useEffect } from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import { type CarouselApi } from "@/components/ui/carousel"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Scene } from "@/lib/scenes"
import { useTranslations, useLocale } from "next-intl"

interface SceneSelectorProps {
  scenes: Scene[]
  selectedScene: Scene
  onSelectScene: (scene: Scene) => void
}

export function SceneSelector({ scenes, selectedScene, onSelectScene }: SceneSelectorProps) {
  const router = useRouter()
  const [api, setApi] = useState<CarouselApi>()
  const [count, setCount] = useState(0)
  const [current, setCurrent] = useState(0)
  const t = useTranslations('sceneSelector')
  const locale = useLocale()

  useEffect(() => {
    if (!api) return
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)
    
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  return (
    <div className="mb-2 relative w-full">
      {/* left fade */}
      <div className={cn(
        "absolute left-12 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none",
        current === 1 && "hidden"
      )} />
  
      <Carousel 
        setApi={setApi} 
        opts={{
          align: "start", 
          dragFree: true
        }} 
        className="w-full px-12 h-12 flex items-center"
      >
        <CarouselContent className="-ml-1">          {scenes.map((scene, idx) => (
            <CarouselItem 
              key={idx} 
              className="pl-3 basis-auto flex items-center" 
              onClick={() => onSelectScene(scene)}
            >
              <Badge 
                variant={selectedScene.name === scene.name ? "default" : "secondary"} 
                className="cursor-pointer rounded-lg px-3 py-1 whitespace-nowrap"
              >
                {locale === 'en' ? (scene.name_en || scene.name) : scene.name}
              </Badge>
            </CarouselItem>
          ))}
          {/* Custom scene button */}
          <CarouselItem key="custom-scene" className="pl-3 basis-auto flex items-center">
            <Badge
              variant="outline"
              className="cursor-pointer rounded-lg px-3 py-1 whitespace-nowrap border-dashed border-2"
              onClick={() => router.push('/scene-manage')}
            >
              {t('customScene')}
            </Badge>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious className="left-0 z-20" />
        <CarouselNext className="right-0 z-20"/>
        {/* right fade */}
        <div className={cn(
          "absolute right-12 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none",
          current === count && "hidden"
        )} />
      </Carousel>
    </div>
  )
}
