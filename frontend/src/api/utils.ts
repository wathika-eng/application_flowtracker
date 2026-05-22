export function formatLocalDate(iso: string | null): string {
  if (!iso) return '\u2014'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatLocalDateTime(iso: string | null): string {
  if (!iso) return '\u2014'
  const d = new Date(iso)
  const tz = d.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop() ?? ''
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ` ${tz}`
}
