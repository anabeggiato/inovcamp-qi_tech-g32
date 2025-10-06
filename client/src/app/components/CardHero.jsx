import React from 'react'

export default function CardHero({ title, subtitle }) {
  return (
    <div className="border-2 border-gray-200 py-4 px-36 rounded-lg space-y-2 transition-shadow hover:shadow-lg flex flex-col items-center justify-center">
      <h3 className="text-3xl text-primary font-bold">{title}</h3>
      <p className="text-gray-400">{subtitle}</p>
    </div>
  )
}
