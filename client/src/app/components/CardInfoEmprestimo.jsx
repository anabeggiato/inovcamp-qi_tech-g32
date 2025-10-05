import React from 'react'

export default function CardInfoEmprestimo({ title, icon, value, subtitle, color = "gray-500" }) {
    return (
        <div className='w-full text-left p-4 border border-border rounded-lg space-y-2 shadow-sm'>
            <p className='w-full flex items-center justify-between text-sm'>{title} {icon}</p>
            <span className='font-bold text-2xl text-black pb-2'>{value}</span>
            <p className='text-sm'>{subtitle}</p>
        </div>
    )
}
