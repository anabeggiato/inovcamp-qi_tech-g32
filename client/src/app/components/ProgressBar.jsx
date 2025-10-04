import React from 'react'

export default function ProgressBar({ progress = 0 }) {
    const normalizedProgress = Math.min(Math.max(progress, 0), 100);
    return (
        <div className="w-full bg-[var(--sea-green)] h-3 rounded-full overflow-hidden">
            <div
                className="bg-[var(--primary)] h-full rounded-s-full"
                style={{ width: `${normalizedProgress}%` }}
            />
        </div>
    )
}