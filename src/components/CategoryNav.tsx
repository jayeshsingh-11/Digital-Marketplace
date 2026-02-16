"use client"

import { PRODUCT_CATEGORIES } from "@/config"
import { Button } from "./ui/button"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useOnClickOutside } from "@/hooks/use-on-click-outside"

const CategoryNav = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const navRef = useRef<HTMLDivElement | null>(null)

    useOnClickOutside(navRef, () => setIsOpen(false))

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsOpen(false)
            }
        }

        document.addEventListener("keydown", handler)
        return () => {
            document.removeEventListener("keydown", handler)
        }
    }, [])

    return (
        <div className="flex justify-center h-full" ref={navRef}>
            <div
                className="flex items-center"
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
            >
                <Button
                    className="gap-1.5"
                    variant={isOpen ? "secondary" : "ghost"}
                >
                    Browse Categories
                    <ChevronDown
                        className={cn("h-4 w-4 transition-all text-muted-foreground", {
                            "-rotate-180": isOpen,
                        })}
                    />
                </Button>
            </div>

            {isOpen ? (
                <div
                    className="absolute inset-x-0 top-full text-sm text-muted-foreground animate-in fade-in-10 slide-in-from-top-5 z-50"
                    onMouseEnter={() => setIsOpen(true)}
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <div
                        className="absolute inset-0 top-1/2 bg-white shadow"
                        aria-hidden="true"
                    />

                    <div className="relative bg-white border-b border-gray-200">
                        <div className="mx-auto max-w-7xl px-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 py-16">
                                {PRODUCT_CATEGORIES.map((category) => (
                                    <div key={category.value} className="group relative text-base sm:text-sm">
                                        <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75 mb-4">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={category.featured[0].imageSrc}
                                                alt={category.label}
                                                className="object-cover object-center w-full h-full"
                                            />
                                        </div>
                                        <Link
                                            href={`/products?category=${category.value}`}
                                            className="block font-medium text-gray-900 group-hover:text-indigo-600 transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {category.label}
                                        </Link>
                                        <p className="mt-1 text-gray-500">
                                            Shop now
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    )
}

export default CategoryNav
