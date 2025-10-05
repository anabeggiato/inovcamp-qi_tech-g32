import React from 'react'

export default function CardFastAction({icon, text}) {
  return (
    <button className='w-full p-4 border border-border rounded-lg flex flex-col items-center space-y-2 hover:bg-primary text-black hover:text-white'>
      <p>{icon}</p>
      <h3>{text}</h3>
    </button>
  )
}
