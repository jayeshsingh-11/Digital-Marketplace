'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { trpc } from '@/trpc/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Upload, X, FileText, Image as ImageIcon, Crop } from 'lucide-react'
import { PRODUCT_CATEGORIES } from '@/config'
import ImageCropper from '@/components/ImageCropper'

const ProductFormValidator = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    price: z.string().min(1, 'Price is required'),
    category: z.string().min(1, 'Category is required'),
})

type TProductFormValidator = z.infer<typeof ProductFormValidator>

const Page = () => {
    const router = useRouter()
    const [isUploading, setIsUploading] = useState(false)

    // State for multiple files
    const [productFiles, setProductFiles] = useState<File[]>([])
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])

    // Cropper State
    const [isCropperOpen, setIsCropperOpen] = useState(false)
    const [croppingImageSrc, setCroppingImageSrc] = useState<string | null>(null)
    const [croppingImageIndex, setCroppingImageIndex] = useState<number | null>(null)

    const [showCustomCategory, setShowCustomCategory] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<TProductFormValidator>({
        resolver: zodResolver(ProductFormValidator),
    })

    const selectedCategory = watch('category')

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        if (val === 'custom') {
            setShowCustomCategory(true)
            setValue('category', '') // Clear value for custom input
        } else {
            setValue('category', val)
        }
    }

    const clearCustomCategory = () => {
        setShowCustomCategory(false)
        setValue('category', '')
    }

    const { mutate: createProduct, isLoading: isCreating } = trpc.seller.createProduct.useMutation({
        onSuccess: ({ productId }) => {
            toast.success('Product created successfully')
            router.push('/products?sort=desc&category=' + (selectedCategory || ''))
        },
        onError: (err) => {
            toast.error(`Failed to create product: ${err.message}`)
            console.error(err)
        }
    })

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            if (imageFiles.length + files.length > 10) {
                toast.error('You can only upload up to 10 images')
                return
            }

            const newFiles = [...imageFiles, ...files]
            setImageFiles(newFiles)

            // Generate previews
            const newPreviews = files.map(file => URL.createObjectURL(file))
            setImagePreviews([...imagePreviews, ...newPreviews])
        }
    }

    const removeImage = (index: number) => {
        const newFiles = [...imageFiles]
        newFiles.splice(index, 1)
        setImageFiles(newFiles)

        const newPreviews = [...imagePreviews]
        URL.revokeObjectURL(newPreviews[index]) // Cleanup
        newPreviews.splice(index, 1)
        setImagePreviews(newPreviews)
    }

    const openCropper = (index: number) => {
        setCroppingImageSrc(imagePreviews[index])
        setCroppingImageIndex(index)
        setIsCropperOpen(true)
    }

    const handleCropComplete = async (croppedBlob: Blob) => {
        if (croppingImageIndex === null) return

        // Convert blob to File
        const originalFile = imageFiles[croppingImageIndex]
        const croppedFile = new File([croppedBlob], originalFile.name, { type: 'image/jpeg' })

        // Update Files
        const newFiles = [...imageFiles]
        newFiles[croppingImageIndex] = croppedFile
        setImageFiles(newFiles)

        // Update Preview
        const newPreviews = [...imagePreviews]
        URL.revokeObjectURL(newPreviews[croppingImageIndex])
        newPreviews[croppingImageIndex] = URL.createObjectURL(croppedFile)
        setImagePreviews(newPreviews)

        toast.success('Image updated')
    }

    const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            setProductFiles([...productFiles, ...files])
        }
    }

    const removeProductFile = (index: number) => {
        const newFiles = [...productFiles]
        newFiles.splice(index, 1)
        setProductFiles(newFiles)
    }

    const onSubmit = async (data: TProductFormValidator) => {
        if (productFiles.length === 0 || imageFiles.length === 0) {
            toast.error('Please upload at least one product file and one image')
            return
        }

        setIsUploading(true)
        const supabase = createClient()

        try {
            // 1. Upload Product Files
            const uploadedProductFiles = []
            for (const file of productFiles) {
                const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
                const fileName = `${Date.now()}-${cleanName}`
                const { data: fileData, error: fileError } = await supabase
                    .storage
                    .from('product_files')
                    .upload(fileName, file)

                if (fileError) throw fileError

                uploadedProductFiles.push({
                    filename: file.name,
                    url: fileData.path
                })
            }

            // 2. Upload Images
            const uploadedImages = []
            for (const file of imageFiles) {
                const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
                const fileName = `${Date.now()}-${cleanName}`
                const { data: imageData, error: imageError } = await supabase
                    .storage
                    .from('media')
                    .upload(fileName, file)

                if (imageError) throw imageError

                const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName)

                uploadedImages.push({
                    filename: file.name,
                    url: publicUrl
                })
            }

            // 3. Create Product
            setIsUploading(false) // Reset upload state before mutation starts
            createProduct({
                name: data.name,
                description: data.description,
                price: parseFloat(data.price),
                category: data.category,
                productFiles: uploadedProductFiles,
                images: uploadedImages
            })


        } catch (error) {
            console.error(error)
            toast.error('Something went wrong during upload')
            setIsUploading(false)
        }
    }

    return (
        <div className='min-h-screen bg-gray-50/50 py-8 md:py-12'>
            <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='mb-8'>
                    <h1 className='text-2xl md:text-3xl font-bold text-gray-900 tracking-tight'>Create New Product</h1>
                    <p className='text-gray-500 mt-2 text-sm md:text-base'>Add details, images, and files for your digital product.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                        {/* Left Column: Product Details */}
                        <div className='lg:col-span-2 space-y-8'>
                            {/* Basic Info Card */}
                            <div className='bg-white rounded-xl border border-gray-100 p-6 md:p-8 shadow-sm'>
                                <h3 className='text-lg font-semibold text-gray-900 mb-6'>Product Details</h3>
                                <div className='space-y-6'>
                                    <div className='grid gap-2'>
                                        <Label htmlFor='name' className="text-base">Name</Label>
                                        <Input {...register('name')} placeholder='e.g. Ultimate UI Kit' className="h-11" />
                                        {errors.name && <p className='text-sm text-red-500'>{errors.name.message}</p>}
                                    </div>

                                    <div className='grid gap-2'>
                                        <Label htmlFor='description' className="text-base">Description</Label>
                                        <Textarea {...register('description')} placeholder='Describe your product features...' className='min-h-[150px] resize-none p-4' />
                                        {errors.description && <p className='text-sm text-red-500'>{errors.description.message}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Images Card */}
                            <div className='bg-white rounded-xl border border-gray-100 p-6 md:p-8 shadow-sm'>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className='text-lg font-semibold text-gray-900'>Product Images</h3>
                                    <span className="text-sm text-muted-foreground">{imageFiles.length} / 10</span>
                                </div>

                                <div className='grid grid-cols-3 sm:grid-cols-4 gap-4 mb-4'>
                                    {imagePreviews.map((src, index) => (
                                        <div key={index} className='relative aspect-square rounded-lg overflow-hidden border border-gray-200 group bg-gray-50'>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={src} alt={`Preview ${index}`} className='w-full h-full object-cover' />

                                            <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2'>
                                                <button
                                                    type='button'
                                                    onClick={() => openCropper(index)}
                                                    className='p-1.5 bg-white/90 rounded-full hover:bg-white text-gray-700 shadow-sm'
                                                    title="Crop Image"
                                                >
                                                    <Crop className='h-4 w-4' />
                                                </button>
                                                <button
                                                    type='button'
                                                    onClick={() => removeImage(index)}
                                                    className='p-1.5 bg-white/90 rounded-full hover:bg-white text-red-600 shadow-sm'
                                                    title="Remove Image"
                                                >
                                                    <X className='h-4 w-4' />
                                                </button>
                                            </div>

                                            {index === 0 && (
                                                <span className='absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-2 py-1 rounded'>Cover</span>
                                            )}
                                        </div>
                                    ))}

                                    {imageFiles.length < 10 && (
                                        <label className='aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-black/20 hover:bg-gray-50 flex flex-col items-center justify-center cursor-pointer transition-all'>
                                            <div className='p-3 bg-gray-100 rounded-full mb-2 group-hover:scale-110 transition-transform'>
                                                <ImageIcon className='h-5 w-5 text-gray-400' />
                                            </div>
                                            <span className='text-xs font-medium text-gray-600'>Add Image</span>
                                            <input
                                                type='file'
                                                accept='image/*'
                                                multiple
                                                className='hidden'
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                    )}
                                </div>
                                <p className='text-xs text-gray-500'>First image will be the cover. Tap an image to edit.</p>
                            </div>

                            {/* Files Card */}
                            <div className='bg-white rounded-xl border border-gray-100 p-6 md:p-8 shadow-sm'>
                                <h3 className='text-lg font-semibold text-gray-900 mb-6'>Product Files</h3>

                                <div className='space-y-4'>
                                    <div className='border-2 border-dashed border-gray-200 rounded-xl p-8 hover:border-black/20 hover:bg-gray-50 transition-all text-center relative group'>
                                        <div className='mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform'>
                                            <Upload className='h-6 w-6 text-gray-600' />
                                        </div>
                                        <p className='text-sm font-medium text-gray-900'>
                                            <span className='hover:underline cursor-pointer'>Upload files</span>
                                            {' '}or{' '}
                                            <span
                                                className='hover:underline cursor-pointer text-gray-600'
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    document.getElementById('folder-upload')?.click();
                                                }}
                                            >
                                                folder
                                            </span>
                                        </p>
                                        <p className='text-xs text-gray-500 mt-2'>Supports ZIP, PDF, and more</p>

                                        {/* Standard File Input */}
                                        <input
                                            type='file'
                                            multiple
                                            className='hidden'
                                            id='file-upload'
                                            onChange={handleProductFileChange}
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer absolute inset-0"></label>

                                        {/* Folder Input */}
                                        <input
                                            type='file'
                                            multiple
                                            className='hidden'
                                            id='folder-upload'
                                            onChange={handleProductFileChange}
                                            {...{ webkitdirectory: "", directory: "" } as any}
                                        />
                                    </div>

                                    {productFiles.length > 0 && (
                                        <div className='space-y-3'>
                                            {productFiles.map((file, index) => (
                                                <div key={index} className='flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 shadow-sm'>
                                                    <div className='flex items-center gap-3 overflow-hidden'>
                                                        <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <FileText className='h-5 w-5' />
                                                        </div>
                                                        <div className='min-w-0'>
                                                            <p className='text-sm font-medium text-gray-900 truncate'>{file.name}</p>
                                                            <p className='text-xs text-gray-500'>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type='button'
                                                        onClick={() => removeProductFile(index)}
                                                        className='p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors'
                                                    >
                                                        <X className='h-4 w-4' />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Settings & Actions */}
                        <div className='space-y-8'>
                            <div className='bg-white rounded-xl border border-gray-100 p-6 md:p-8 shadow-sm'>
                                <h3 className='text-lg font-semibold text-gray-900 mb-6'>Pricing & Category</h3>
                                <div className='space-y-6'>
                                    <div className='grid gap-2'>
                                        <Label htmlFor='price' className="text-base">Price (INR)</Label>
                                        <div className='relative'>
                                            <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium'>₹</span>
                                            <Input {...register('price')} type='number' min='0' step='0.01' placeholder='0.00' className='pl-8 h-11' />
                                        </div>
                                        {errors.price && <p className='text-sm text-red-500'>{errors.price.message}</p>}
                                    </div>

                                    <div className='grid gap-2'>
                                        <Label htmlFor='category' className="text-base">Category</Label>

                                        {!showCustomCategory ? (
                                            <div className="relative">
                                                <select
                                                    className='flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none'
                                                    onChange={handleCategoryChange}
                                                    defaultValue={selectedCategory && !PRODUCT_CATEGORIES.find(c => c.value === selectedCategory) ? 'custom' : selectedCategory}
                                                >
                                                    <option value=''>Select category</option>
                                                    {PRODUCT_CATEGORIES.map((cat) => (
                                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                    ))}
                                                    <option value='custom'>Other (Write your own)</option>
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className='flex gap-2 items-center'>
                                                <Input
                                                    {...register('category')}
                                                    placeholder='Enter custom category'
                                                    autoFocus
                                                    className="h-11"
                                                />
                                                <Button
                                                    type='button'
                                                    variant='ghost'
                                                    size='icon'
                                                    onClick={clearCustomCategory}
                                                    title='Back to list'
                                                >
                                                    <X className='h-4 w-4' />
                                                </Button>
                                            </div>
                                        )}

                                        {/* Hidden input to register category when in select mode to keep form valid */}
                                        {!showCustomCategory && <input type='hidden' {...register('category')} />}

                                        {errors.category && <p className='text-sm text-red-500'>{errors.category.message}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className='flex flex-col gap-3 sticky bottom-4 md:static'>
                                <Button
                                    className='w-full bg-black hover:bg-zinc-900 text-white shadow-lg md:shadow-none h-12 text-base'
                                    size='lg'
                                    disabled={isUploading || isCreating}
                                >
                                    {(isUploading || isCreating) && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                                    {isUploading ? 'Uploading Files...' : isCreating ? 'Creating Product...' : 'Publish Product'}
                                </Button>
                                <Button
                                    type='button'
                                    variant='ghost'
                                    className='w-full text-gray-500 hover:text-gray-900'
                                    onClick={() => router.back()}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>

                {croppingImageSrc && (
                    <ImageCropper
                        imageSrc={croppingImageSrc}
                        isOpen={isCropperOpen}
                        onClose={() => setIsCropperOpen(false)}
                        onCropComplete={handleCropComplete}
                    />
                )}
            </div>
        </div>
    )
}

export default Page
