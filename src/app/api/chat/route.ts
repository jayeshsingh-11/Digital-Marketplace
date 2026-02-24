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
        
        You have three tools available:
        1. searchProducts: Use this to search for products (e.g., templates, UI kits, specific items) by query, category, and/or max price (e.g., "under 1000").
        2. getMarketplaceStats: Use this if the user asks broad questions like "how many products do you have?" or "what categories of products do you sell?".
        3. getUserProfile: Use this if the user asks "who am I?", "what is my name?", or wants to see their order history.
        
        CRITICAL RULES FOR RESPONDING:
        1. Start by considering if a tool is needed based on the user's input.
        2. If the user greets you (e.g., "hello"), ONLY reply with a greeting back (e.g., "Hello! How can I assist you today?").
        3. DO NOT output any inner thoughts, explanations of whether you need to search a database, or preambles like "No function call is necessary".
        4. When a tool returns data, summarize it naturally and concisely for the user.
        5. Never break character. You are the assistant speaking directly to the user.
        
        Keep your answers structured, visually appealing, and concise.`,
            messages,
            tools: {
                searchProducts: tool({
                    description: 'Search the marketplace database for products. Returns matching products with their prices and categories. You can search by text query, specific category, and/or maximum price.',
                    parameters: z.object({
                        query: z.string().optional().describe('The search terms, e.g., "UI kit", "template", "dashboard". Omit if just asking for a category or price range.'),
                        category: z.string().optional().describe('The category of products, e.g., "ui_kits", "icons".'),
                        maxPrice: z.number().optional().describe('The maximum price the user is willing to pay. If they say "under 1000", this is 1000.'),
                    }),
                    execute: async ({ query, category, maxPrice }) => {
                        const supabase = createClient(cookies());

                        let queryBuilder = supabase
                            .from('products')
                            .select('id, name, price, category, product_images(image_id, media:image_id(url))')
                            .eq('approved', true);

                        if (query) {
                            queryBuilder = queryBuilder.ilike('name', `%${query}%`);
                        }

                        if (category) {
                            const formattedCategory = category.replace(' ', '_');
                            queryBuilder = queryBuilder.ilike('category', `%${formattedCategory}%`);
                        }

                        queryBuilder = queryBuilder.limit(10);

                        if (maxPrice !== undefined) {
                            queryBuilder = queryBuilder.lte('price', maxPrice);
                        }

                        const { data, error } = await queryBuilder;

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
                getMarketplaceStats: tool({
                    description: 'Get general statistics about the marketplace, such as the total number of products available and the different categories being sold.',
                    parameters: z.object({}),
                    execute: async () => {
                        const supabase = createClient(cookies());

                        // Get total count
                        const { count, error: countError } = await supabase
                            .from('products')
                            .select('*', { count: 'exact', head: true })
                            .eq('approved', true);

                        // Get unique categories (Group by isn't directly supported in simple JS client without RPC, so we'll fetch a small set and extract categories, or just use a known list if it's small)
                        // A quick hack for categories since we don't have an RPC is just fetching the category column
                        const { data: catData, error: catError } = await supabase
                            .from('products')
                            .select('category')
                            .eq('approved', true);

                        const uniqueCategories = catData ? Array.from(new Set(catData.map(c => c.category))) : [];

                        if (countError || catError) {
                            return { error: 'Could not fetch marketplace statistics at this time.' };
                        }

                        return {
                            totalProducts: count || 0,
                            categories: uniqueCategories,
                        };
                    }
                }),
                getUserProfile: tool({
                    description: "Fetch the currently logged-in user's profile information, including their name, email, and their recent order history/invoices.",
                    parameters: z.object({}),
                    execute: async () => {
                        try {
                            const supabase = createClient(cookies());

                            // Check if user is logged in
                            const { data: { user }, error: authError } = await supabase.auth.getUser();
                            if (authError || !user) {
                                return { error: 'Please sign in to view your account details! Use the Sign In button at the top of the page.' };
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
                                    name: profile?.name || 'User',
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
                        } catch (e: any) {
                            console.error('Failed to get user profile', e);
                            return { error: 'Failed to authenticate your session. Please try logging in again.' };
                        }
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
