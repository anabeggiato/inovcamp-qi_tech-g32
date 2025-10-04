const colorMap = {
  purple: "bg-primary/10 text-primary",
  blue: "bg-sea-green/10 text-sea-green",
  green: "bg-success-green/10 text-success-green",
}

export default function CardDiferencial({ icon, title, description, color }) {
  return (
    <div className="flex flex-col items-center p-8 border-2 border-border rounded-lg">
      <div className={`h-15 w-15 rounded-full flex items-center justify-center ${colorMap[color]}`}>
        {icon}
      </div>

      <span className="text-black font-semibold">{title}</span>
      <p>{description}</p>
    </div>
  )
}
