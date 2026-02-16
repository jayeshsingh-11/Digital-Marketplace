"use client"

import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { trpc } from "@/trpc/client"
import { useOnClickOutside } from "@/hooks/use-on-click-outside"
import Image from "next/image"
import Link from "next/link"
import { useDebounce } from "@/hooks/use-debounce"

const SearchBar = () => {
    const [query, setQuery] = useState("")
    const router = useRouter()
    const commandRef = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState(false)

    const debouncedQuery = useDebounce(query, 300)

    const { data: queryResults, isLoading } = trpc.searchProducts.useQuery(
        { query: debouncedQuery },
        {
            enabled: debouncedQuery.length > 0,
            onSuccess: () => setIsOpen(true)
        }
    )

    useOnClickOutside(commandRef, () => setIsOpen(false))

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsOpen(false)
            }
        }
        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [])

    const handleSearch = () => {
        if (!query) return
        router.push(`/products?query=${encodeURIComponent(query)}`) // Assuming we implement full search page later
        setIsOpen(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch()
        }
    }

    return (
        <div className="relative w-full max-w-lg lg:max-w-xs" ref={commandRef}>
            <div className="relative">
                <Input
                    placeholder="Search for products..."
                    className="w-full pl-10 pr-4"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        if (e.target.value.length === 0) setIsOpen(false)
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (debouncedQuery.length > 0) setIsOpen(true)
                    }}
                />
                <Button
                    size="sm"
                    variant="ghost"
                    className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={handleSearch}
                >
                    <Search className="h-4 w-4 text-muted-foreground" />
                </Button>
            </div>

            {isOpen && queryResults && queryResults.length > 0 ? (
                <div className="absolute top-full mt-2 w-full rounded-md border bg-white shadow-md z-50 overflow-hidden animate-in fade-in-0 zoom-in-95">
                    <ul className="py-2">
                        {queryResults.map((product: any) => (
                            <li key={product.id}>
                                <Link
                                    href={`/product/${product.id}`}
                                    className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors gap-3"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {product.image ? (
                                        <div className="relative h-8 w-8 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-8 w-8 rounded bg-gray-100 flex-shrink-0" />
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</span>
                                        <span className="text-xs text-muted-foreground">In {product.category}</span>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
                        <button
                            onClick={handleSearch}
                            className="text-xs text-indigo-600 font-medium hover:underline flex items-center"
                        >
                            View all results for &quot;{query}&quot;
                        </button>
                    </div>
                </div>
            ) : null}

            {isOpen && queryResults && queryResults.length === 0 && !isLoading ? (
                <div className="absolute top-full mt-2 w-full rounded-md border bg-white shadow-md z-50 p-4 text-center text-sm text-neutral-500">
                    No results found.
                </div>
            ) : null}
        </div>
    )
}

export default SearchBar
