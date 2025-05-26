import { Dot } from "lucide-react"

export function TypingIndicator() {
  return (
    <div className="justify-left flex space-x-1">
      <div className="rounded-lg bg-muted p-3">
        <div className="flex -space-x-2.5">
          <Dot className="h-5 w-5 motion animate-pulse" />
          <Dot className="h-5 w-5 motion animate-pulse delay-[0.50s]" />
          <Dot className="h-5 w-5 motion animate-pulse delay-[1.0s]" />
        </div>
      </div>
    </div>
  )
}
