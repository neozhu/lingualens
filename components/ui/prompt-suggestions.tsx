interface PromptSuggestionsProps {
  label: string
  append: (message: { role: "user"; content: string }) => void
  suggestions: string[]
}

export function PromptSuggestions({
  label,
  append,
  suggestions,
}: PromptSuggestionsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-center text-2xl font-bold motion-preset-slide-down">{label}</h2>
      <div className="flex gap-6 text-sm mb-4">
        {suggestions.map((suggestion, idx) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => append({ role: "user", content: suggestion })}
            className="h-max flex-1 rounded-xl border bg-background p-4 hover:bg-muted motion motion-preset-slide-left"
            style={{ animationDelay: `${100 + idx * 150}ms` }}
          >
            <p>{suggestion}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
