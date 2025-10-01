
export default function CardFinanciamento({ icon, title, subtitle, description }) {
    return (
        <div className='flex p-6 border-2 border-border rounded-lg text-left'>
            <div>
                <div className="w-12 h-12 bg-purple-gradient rounded-lg flex items-center justify-center mb-4">
                    {icon}
                </div>
            </div>

            <div className='flex flex-col justify-center ml-4 text-black space-y-2'>
                <h4 className='font-bold text-lg'>{title}</h4>
                <p className=''>{subtitle}</p>
                <p className='text-sm text-gray-500'>{description}</p>
            </div>
        </div>
    )
}
