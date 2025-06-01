export const DEFAULT_THEMES = [
  {
    name: "Default",
    value: "default",
  },
  {
    name: "Neutral",
    value: "neutral",
  },
  {
    name: "Stone",
    value: "stone",
  },
  {
    name: "Scaled",
    value: "scaled",
  },
  {
    name: "Mono",
    value: "mono",
  },
]

export const COLOR_THEMES = [
  {
    name: "Gray",
    value: "gray",
  },
  {
    name: "Blue",
    value: "blue",
  },
  {
    name: "Green",
    value: "green",
  },
  {
    name: "Amber",
    value: "amber",
  },
  {
    name: "Rose",
    value: "rose",
  },
  {
    name: "Purple",
    value: "purple",
  },
  {
    name: "Orange",
    value: "orange",
  },
  {
    name: "Teal",
    value: "teal",
  },
]
// Define a common Theme type that works for both arrays
export type Theme = {
  name: string;
  value: string;
}

// If you still want to create types that specifically extract the possible values:
export type DefaultThemeValue = (typeof DEFAULT_THEMES)[number]["value"]
export type ColorThemeValue = (typeof COLOR_THEMES)[number]["value"]

