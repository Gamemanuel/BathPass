"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Period = "AM" | "PM"

export type TimeValue = {
    hour: number
    minute: number
    period: Period
}

export function TimePicker({
                               value,
                               onChange,
                               onConfirm,
                               onCancel
                           }: {
    value?: TimeValue
    onChange?: (val: TimeValue) => void
    onConfirm?: (val: TimeValue) => void
    onCancel?: () => void
}) {
    const now = new Date()
    const defaultHour = now.getHours()
    const defaultMinute = now.getMinutes()
    const defaultPeriod: Period = defaultHour < 12 ? "AM" : "PM"
    const defaultDisplayHour = defaultHour % 12 || 12

    const pad2 = (n: number) => String(n).padStart(2, "0")
    const clampHour = (n: number) => Math.min(Math.max(n || 0, 1), 12)
    const clampMinute = (n: number) => Math.min(Math.max(n || 0, 0), 59)

    const initHour = value?.hour ?? defaultDisplayHour
    const initMinute = value?.minute ?? defaultMinute
    const initPeriod = value?.period ?? defaultPeriod

    const [hourStr, setHourStr] = React.useState(pad2(initHour))
    const [minuteStr, setMinuteStr] = React.useState(pad2(initMinute))
    const [period, setPeriod] = React.useState<Period>(initPeriod)

    const hourRef = React.useRef<HTMLInputElement>(null)
    const minuteRef = React.useRef<HTMLInputElement>(null)

    const getCurrentValue = (): TimeValue => {
        const hNum = parseInt(hourStr, 10) || 0
        let currPeriod = period
        let displayH: number

        if (hNum > 12 && hNum <= 23) {
            displayH = hNum - 12
            currPeriod = "PM"
        } else if (hNum === 0 || hNum === 24) {
            displayH = 12
            currPeriod = "AM"
        } else {
            displayH = clampHour(hNum)
        }

        return {
            hour: displayH,
            minute: clampMinute(parseInt(minuteStr, 10) || 0),
            period: currPeriod
        }
    }

    const handleChange = () => {
        onChange?.(getCurrentValue())
    }

    const processHour = (hNum: number, updatePeriod: boolean = true): { newHour: number, newPeriod: Period } => {
        let newHour: number
        let newPeriod = period

        if (hNum > 12 && hNum <= 23) {
            newHour = hNum - 12
            if (updatePeriod) newPeriod = "PM"
        } else if (hNum === 0 || hNum === 24) {
            newHour = 12
            if (updatePeriod) newPeriod = "AM"
        } else {
            newHour = clampHour(hNum)
        }

        return { newHour, newPeriod }
    }

    const get24Hour = () => {
        const hNum = parseInt(hourStr, 10) || 0
        if (hNum > 12 && hNum <= 23) {
            return hNum
        } else if (hNum === 0 || hNum === 24) {
            return 0
        } else {
            if (period === "AM") {
                return hNum === 12 ? 0 : hNum
            } else {
                return hNum === 12 ? 12 : hNum + 12
            }
        }
    }

    const setFrom24 = (hour24: number, min: number) => {
        const p: Period = hour24 < 12 ? "AM" : "PM"
        const displayH = hour24 % 12 || 12
        const clampedMin = clampMinute(min)
        setPeriod(p)
        setHourStr(pad2(displayH))
        setMinuteStr(pad2(clampedMin))
        onChange?.({ hour: displayH, minute: clampedMin, period: p })
    }

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value.replace(/\D/g, "").slice(0, 4)

        if (input.length <= 2) {
            setHourStr(input)
        } else {
            const hInput = input.slice(0, 2)
            const mInput = input.slice(2, 4)
            const hNum = parseInt(hInput, 10) || 0
            const { newHour, newPeriod } = processHour(hNum)
            setHourStr(pad2(newHour))
            setPeriod(newPeriod)
            setMinuteStr(mInput)
            handleChange()
            setTimeout(() => {
                minuteRef.current?.focus()
                const len = mInput.length
                minuteRef.current?.setSelectionRange(len, len)
            }, 0)
        }
    }

    const handleHourBlur = () => {
        const hNum = parseInt(hourStr, 10) || 0
        const { newHour, newPeriod } = processHour(hNum)
        setHourStr(pad2(newHour))
        setPeriod(newPeriod)
        handleChange()
    }

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value.replace(/\D/g, "").slice(0, 2)
        setMinuteStr(input)
        handleChange()
    }

    const handleMinuteBlur = () => {
        const num = clampMinute(parseInt(minuteStr, 10) || 0)
        setMinuteStr(pad2(num))
        handleChange()
    }

    const selectPeriod = (p: Period) => {
        setPeriod(p)
        handleChange()
    }

    // Handle arrow key navigation for AM/PM block
    const handlePeriodKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (["ArrowUp", "ArrowLeft"].includes(e.key)) {
            e.preventDefault()
            const newP = period === "AM" ? "PM" : "AM"
            setPeriod(newP)
            handleChange()
        } else if (["ArrowDown", "ArrowRight"].includes(e.key)) {
            e.preventDefault()
            const newP = period === "PM" ? "AM" : "PM"
            setPeriod(newP)
            handleChange()
        }
    }

    const handleHourKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowUp") {
            e.preventDefault()
            let hour24 = get24Hour()
            hour24 = (hour24 + 1) % 24
            const min = parseInt(minuteStr, 10) || 0
            setFrom24(hour24, min)
        } else if (e.key === "ArrowDown") {
            e.preventDefault()
            let hour24 = get24Hour()
            hour24 = (hour24 - 1 + 24) % 24
            const min = parseInt(minuteStr, 10) || 0
            setFrom24(hour24, min)
        }
    }

    const handleMinuteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowUp") {
            e.preventDefault()
            let min = parseInt(minuteStr, 10) || 0
            min += 1
            let carry = 0
            if (min > 59) {
                min = 0
                carry = 1
            }
            let hour24 = get24Hour() + carry
            hour24 %= 24
            setFrom24(hour24, min)
        } else if (e.key === "ArrowDown") {
            e.preventDefault()
            let min = parseInt(minuteStr, 10) || 0
            min -= 1
            let carry = 0
            if (min < 0) {
                min = 59
                carry = -1
            }
            let hour24 = get24Hour() + carry
            if (hour24 < 0) hour24 += 24
            setFrom24(hour24, min)
        }
    }

    return (
        <Card className="w-[283px] p-6 rounded-xl shadow-lg bg-white dark:bg-neutral-900 flex flex-col gap-4">
            <div className="flex items-center gap-4">
                {/* Hour */}
                <input
                    ref={hourRef}
                    value={hourStr}
                    onChange={handleHourChange}
                    onBlur={handleHourBlur}
                    onFocus={(e) => e.target.select()}
                    onKeyDown={handleHourKeyDown}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={cn(
                        "w-16 text-center text-2xl font-semibold rounded-lg outline-none px-3 py-2",
                        "bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-100",
                        "focus:ring-2 focus:ring-[#3094FF]"
                    )}
                />

                <span className="text-xl font-bold text-gray-700 dark:text-gray-200">:</span>

                {/* Minute */}
                <input
                    ref={minuteRef}
                    value={minuteStr}
                    onChange={handleMinuteChange}
                    onBlur={handleMinuteBlur}
                    onFocus={(e) => e.target.select()}
                    onKeyDown={handleMinuteKeyDown}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={cn(
                        "w-16 text-center text-2xl font-semibold rounded-lg outline-none px-3 py-2",
                        "bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-100",
                        "focus:ring-2 focus:ring-[#3094FF]"
                    )}
                />

                {/* AM/PM block as single tabbable element */}
                <div
                    role="group"
                    aria-label="AM/PM selection"
                    tabIndex={0}
                    onKeyDown={handlePeriodKeyDown}
                    className="flex flex-col rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#3094FF]"
                >
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => selectPeriod("AM")}
                        tabIndex={-1}
                        className={cn(
                            "px-4 py-2 text-sm font-semibold rounded-none",
                            period === "AM"
                                ? "bg-[#3094FF] text-white hover:bg-[#5aaeff]"
                                : "bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-neutral-800"
                        )}
                    >
                        AM
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => selectPeriod("PM")}
                        tabIndex={-1}
                        className={cn(
                            "px-4 py-2 text-sm font-semibold rounded-none",
                            period === "PM"
                                ? "bg-[#3094FF] text-white hover:bg-[#5aaeff]"
                                : "bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-neutral-800"
                        )}
                    >
                        PM
                    </Button>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-end justify-between">
                <div className="text-[#3094FF]"></div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="text-[#3094FF] hover:bg-blue-50 dark:hover:bg-neutral-800"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="ghost"
                        className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                        onClick={() => onConfirm?.(getCurrentValue())}
                    >
                        OK
                    </Button>
                </div>
            </div>
        </Card>
    )
}