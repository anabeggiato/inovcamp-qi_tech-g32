import React from 'react'

export default function WorkingStep({n, title, description}) {
    return (
        <div className='flex items-center gap-2'>
            <div className='flex items-center justify-center text-white text-2xl w-14 h-14 bg-purple-gradient rounded-full'>
                {n}
            </div>
            <div className='flex flex-col justify-center space-y-2 pl-2 text-left'>
                <h4 className='font-semibold text-black'>{title}</h4>
                <p>{description}</p>
            </div>
        </div>
    )
}
