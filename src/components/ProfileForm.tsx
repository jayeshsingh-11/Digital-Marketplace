'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { trpc } from '@/trpc/client'
import { toast } from 'sonner'
import { Loader2, User as UserIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

const profileSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).optional().or(z.literal('')),
})

export function ProfileForm() {
    const [uploading, setUploading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    const { data: profile, isLoading } = trpc.profile.getProfile.useQuery()
    const utils = trpc.useContext()

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: '',
        },
    })

    // Pre-fill form
    useEffect(() => {
        if (profile) {
            form.setValue('name', profile.name || '')
            setAvatarUrl(profile.imageUrl)
        }
    }, [profile, form])

    const { mutate: updateProfile, isLoading: isSaving } = trpc.profile.updateProfile.useMutation({
        onSuccess: () => {
            toast.success('Profile updated!')
            utils.profile.getProfile.invalidate()
        },
        onError: () => {
            toast.error('Failed to update profile.')
        },
    })

    async function onSubmit(values: z.infer<typeof profileSchema>) {
        updateProfile({
            name: values.name || undefined,
            imageUrl: avatarUrl || undefined,
        })
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const supabase = createClient()

        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        try {
            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)

            if (uploadError) throw uploadError

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
            setAvatarUrl(data.publicUrl)
            toast.success('Image uploaded ready to save')
        } catch (error) {
            console.error(error)
            toast.error('Error uploading image')
        } finally {
            setUploading(false)
        }
    }

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col items-center gap-4">
                <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                    {avatarUrl ? (
                        <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <UserIcon className="h-12 w-12 text-gray-400" />
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" type="button" disabled={uploading} onClick={() => document.getElementById('avatar-upload')?.click()}>
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Change Picture
                    </Button>
                    <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                    />
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={isSaving || uploading}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </form>
            </Form>
        </div>
    )
}
