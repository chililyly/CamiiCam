export const layouts = [
  { id: 'A', name: 'Classic Layout A', size: '2x6 strip', shots: 4, columns: 1, tilt: -11 },
  { id: 'B', name: 'Classic Layout B', size: '2x6 strip', shots: 3, columns: 1, tilt: 11 },
  { id: 'C', name: 'Classic Layout C', size: '4x4', shots: 4, columns: 2, tilt: 0 },
  { id: 'D', name: 'Classic Layout D', size: '4x4', shots: 4, columns: 2, tilt: 0 },
]

export const filters = [
  { id: 'none', label: 'No filter', css: 'none' },
  { id: 'mono', label: 'Mono', css: 'grayscale(1)' },
  { id: 'bright', label: 'Bright', css: 'brightness(1.2) contrast(1.05)' },
  { id: 'retro', label: 'Retro', css: 'sepia(0.65) contrast(1.1) saturate(0.95)' },
  { id: 'cool', label: 'Cool', css: 'hue-rotate(8deg) saturate(1.15)' },
  { id: 'soft', label: 'Soft', css: 'contrast(0.95) brightness(1.08) saturate(0.9)' },
]

export const faqs = [
  {
    question: 'How does the photobooth flow work?',
    answer:
      'Select a frame layout, set your timer and filter, then capture your session using an uploaded image or camera stream.',
  },
  {
    question: 'Can I save sessions to Supabase?',
    answer:
      'Yes. Add your Supabase URL and publishable key in .env, create the required table and storage bucket, then session metadata and photos upload automatically.',
  },
  {
    question: 'Can users contact me from this page?',
    answer:
      'The About page includes a contact form that can insert records into a Supabase table named contact_messages.',
  },
  {
    question: 'Will this design work on mobile?',
    answer:
      'Yes. The layout is responsive and keeps the same visual language on desktop and mobile screens.',
  },
]

export function dataUrlToBlob(dataUrl) {
  const [header, body] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] || 'image/png'
  const binary = atob(body)
  const len = binary.length
  const buffer = new Uint8Array(len)
  for (let i = 0; i < len; i += 1) {
    buffer[i] = binary.charCodeAt(i)
  }
  return new Blob([buffer], { type: mime })
}
