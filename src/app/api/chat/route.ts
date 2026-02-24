import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const nvidia = createOpenAI({
    baseURL: 'https://integrate.api.nvidia.com/v1',
    apiKey: process.env.NVIDIA_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    try {
        const result = await streamText({
            model: nvidia('meta/llama-3.1-70b-instruct'),
            system: `You are a helpful, professional AI assistant for "Creative Cascade", a premium digital marketplace for digital assets like UI kits, software tools, e-books, and design templates.
        Your goal is to help users find what they are looking for by searching the database and answering questions about the website.
        Always use the searchProducts tool if a user asks for templates, ui kits, or any kind of products we might sell.
        CRITICAL RULES FOR RESPONDING:
        1. If a user says "hello" or greets you, ONLY reply with a greeting back (e.g., "Hello! How can I assist you today?").
        2. DO NOT output any inner thoughts, explanations of whether you need to search a database, or preambles like "No function call is necessary".
        3. Never break character. You are the assistant speaking directly to the user.
        Keep your answers structured, visually appealing, and concise.`,
            messages,
            tools: {
                searchProducts: tool({
                    description: 'Search the marketplace database for products based on a text query. Returns matching products with their prices and categories.',
                    parameters: z.object({
                        query: z.string().describe('The search terms, e.g., "UI kit", "template", "dashboard"'),
                    }),
                    execute: async ({ query }) => {
                        const supabase = createClient(cookies());

                        const { data, error } = await supabase
                            .from('products')
                            .select('id, name, price, category, product_images(image_id, media:image_id(url))')
                            .eq('approved', true)
                            .ilike('name', `%${query}%`)
                            .limit(5);

                        if (error) {
                            console.error('Search error:', error);
                            return { items: [], error: 'Failed to search products' };
                        }

                        // Format results
                        const items = data.map((product: any) => {
                            const media = product.product_images?.[0]?.media;
                            const imageUrl = Array.isArray(media) ? media[0]?.url : media?.url;
                            return {
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                category: product.category,
                                imageUrl: imageUrl || null
                            };
                        });

                        return { items };
                    },
                }),
                getUserProfile: tool({
                    description: "Fetch the currently logged-in user's profile information, including their name, email, and their recent order history/invoices.",
                    parameters: z.object({}),
                    execute: async () => {
                        const supabase = createClient(cookies());

                        // Check if user is logged in
                        const { data: { user }, error: authError } = await supabase.auth.getUser();
                        if (authError || !user) {
                            return { error: 'You are not logged in. Please sign in to view your profile and orders.' };
                        }

                        // Fetch user profile
                        const { data: profile } = await supabase
                            .from('users')
                            .select('name, role, created_at')
                            .eq('id', user.id)
                            .single();

                        // Fetch user orders with product details
                        const { data: orders } = await supabase
                            .from('orders')
                            .select('id, amount, is_paid, created_at, order_products(products(name, price))')
                            .eq('user_id', user.id)
                            .order('created_at', { ascending: false })
                            .limit(5);

                        return {
                            user: {
                                email: user.email,
                                name: profile?.name || 'Unknown',
                                role: profile?.role || 'user',
                                memberSince: profile?.created_at,
                            },
                            recentOrders: orders?.map(order => ({
                                orderId: order.id,
                                amount: order.amount,
                                status: order.is_paid ? 'Paid' : 'Pending',
                                date: order.created_at,
                                items: order.order_products?.map((op: any) => op.products?.name).filter(Boolean)
                            })) || []
                        };
                    }
                })
            },
        });

        return result.toDataStreamResponse();
    } catch (error) {
        console.error('AI Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to generate response' }), { status: 500 });
    }
}
