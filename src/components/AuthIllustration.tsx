
import Image from 'next/image'

interface AuthIllustrationProps {
    imageSrc?: string
    title: string
    subtitle?: string
}

const AuthIllustration = ({
    imageSrc = '/nav/ui-kits/mixed.jpg', // Placeholder
    title,
    subtitle
}: AuthIllustrationProps) => {
    return (
        <div className="hidden lg:flex w-1/2 relative bg-white flex-col items-center justify-center p-12 text-center overflow-hidden">

            {/* Text Content */}
            <div className="relative z-20 max-w-lg mb-6">
                <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4 leading-tight font-playfair">
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-lg text-gray-600 font-light">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Featured Image Collage */}
            <div className="relative z-10 w-full h-[500px] mt-0">
                <Image
                    src={imageSrc}
                    alt="Auth Illustration"
                    fill
                    className="object-contain object-bottom hover:scale-110 transition-transform duration-700 ease-in-out"
                    priority
                />
            </div>

            {/* Decorative Cloud/Background Element if needed */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-blue-50/50 to-transparent pointer-events-none" />
        </div>
    )
}

export default AuthIllustration
