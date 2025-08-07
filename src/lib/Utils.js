// utils/formatTime.js
export function formatTo12h(value) {
    if (!value) return ''
    // value es "HH:mm"
    const [h, m] = value.split(':')
    const date = new Date()
    date.setHours(+h, +m)
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}
