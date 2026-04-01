export const GOOGLE_FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Raleway",
  "Oswald",
  "Merriweather",
  "Playfair Display",
  "Source Sans Pro",
  "Ubuntu",
  "Nunito",
  "PT Sans",
  "Rubik",
] as const

export type GoogleFont = (typeof GOOGLE_FONTS)[number]

export const DESTINATIONS = [
  "Bathroom",
  "Nurse",
  "Office",
  "Library",
  "Guidance",
  "Water Fountain",
  "Locker",
  "Other",
] as const

export const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
] as const

export const REPEAT_TYPES = [
  { value: "none", label: "No Repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "custom", label: "Custom Days" },
] as const
