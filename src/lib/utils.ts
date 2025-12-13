import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date

  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatIssuesCount(issues?: unknown[]) {
  const count = issues?.length ?? 0
  return `${count} ${count === 1 ? "issue" : "issues"}`
}
