"use client"

import * as React from 'react'
import { TimePicker, TimeValue } from '@/components/time-picker' // Adjust the import path as needed

export default function Home() {
    const [time, setTime] = React.useState<TimeValue | undefined>()

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
                <TimePicker
                    value={time}
                    onChange={setTime}
                    // onConfirm can be used if needed, but here we submit via form
                />
        </main>
    )
}