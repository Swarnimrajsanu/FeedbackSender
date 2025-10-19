'use client'

export function generateViewport() {
  if (typeof window === 'undefined') return 'Server cannot access window';
  return `Width: ${window.innerWidth}px`;
}
