

export default function CardCiclo({ icon, title, description, align = "center", bg="purple" }) {
    return (
        <div className={`flex flex-col border-2 border-gray-200 rounded-lg p-6 max-w-[90%] hover:shadow-lg 
        ${align === "center" ? "items-center text-center" : "items-start text-left"}`}>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4
                ${bg === "purple" ? "bg-purple-gradient" : "bg-second-gradient"}`}>
                {icon}
            </div>

            <div>
                <h3 className="font-bold text-black">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </div>
    )
}
