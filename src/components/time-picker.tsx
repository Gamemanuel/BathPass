'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'

export default function TimePicker({
                                       value,
                                       onChange,
                                   }: {
    value: string | null
    onChange: (nextIso: string | null) => void
}) {
    const hhmm = React.useMemo(() => {
        if (!value) return ''
        const d = new Date(value)
        if (isNaN(d.getTime())) return ''
        return `${String(d.getHours()).padStart(2, '0')}:${String(
            d.getMinutes()
        ).padStart(2, '0')}`
    }, [value])

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const val = e.target.value // "HH:mm"
        if (!val) {
            onChange(null)
            return
        }
        const [h, m] = val.split(':').map(Number)
        const base = value ? new Date(value) : new Date()
        base.setHours(h, m, 0, 0)
        onChange(base.toISOString()) // <-- calls your handleUpdateRow immediately
    }

    return (
        <Input
            type="time"
            value={hhmm}
            onChange={handleChange}
            className="bg-transparent border-gray-600"
        />
    )
}