import { cn } from '@/lib/utils'

const Logo = ({ className }: { className?: string }) => {
    return (
        <div className={cn("flex flex-col items-center justify-center leading-none select-none", className)}>
            <span className="font-cursive text-4xl font-black tracking-tight text-gray-900 leading-none">
                Creative
            </span>
            <span className="font-sans text-[0.6rem] tracking-[0.35em] font-normal uppercase text-gray-900 mt-1">
                Cascade
            </span>
        </div>
    )
}

export default Logo
