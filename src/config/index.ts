export const PRODUCT_CATEGORIES = [
  // 1. UI & Design Assets
  {
    label: 'UI & Design Assets',
    value: 'ui_kits' as const,
    featured: [
      {
        name: 'Editor picks',
        href: `/products?category=ui_kits`,
        imageSrc: '/nav/ui-kits/mixed.jpg',
      },
      {
        name: 'New Arrivals',
        href: '/products?category=ui_kits&sort=desc',
        imageSrc: '/nav/ui-kits/blue.jpg',
      },
      {
        name: 'Bestsellers',
        href: '/products?category=ui_kits',
        imageSrc: '/nav/ui-kits/purple.jpg',
      },
    ],
  },
  // 2. Website & App Templates
  {
    label: 'Website & App Templates',
    value: 'templates' as const,
    featured: [
      {
        name: 'Trending Templates',
        href: `/products?category=templates`,
        imageSrc: 'https://loremflickr.com/600/300/website,app?lock=1',
      },
      {
        name: 'Launch Your MVP',
        href: '/products?category=templates&sort=desc',
        imageSrc: 'https://loremflickr.com/600/300/startup?lock=2',
      },
      {
        name: 'Top Sellers',
        href: '/products?category=templates',
        imageSrc: 'https://loremflickr.com/600/300/coding?lock=3',
      },
    ],
  },
  // 3. Icons & Graphics
  {
    label: 'Icons & Graphics',
    value: 'icons' as const,
    featured: [
      {
        name: 'Must-have Icons',
        href: `/products?category=icons`,
        imageSrc: '/nav/icons/picks.jpg',
      },
      {
        name: 'Fresh Icon Sets',
        href: '/products?category=icons&sort=desc',
        imageSrc: '/nav/icons/new.jpg',
      },
      {
        name: 'Global Hits',
        href: '/products?category=icons',
        imageSrc: '/nav/icons/bestsellers.jpg',
      },
    ],
  },
  // 4. Code & Development
  {
    label: 'Code & Development',
    value: 'development' as const,
    featured: [
      {
        name: 'Starter Kits',
        href: `/products?category=development`,
        imageSrc: 'https://loremflickr.com/600/300/code,programming?lock=4',
      },
      {
        name: 'Libraries & Tools',
        href: '/products?category=development&sort=desc',
        imageSrc: 'https://loremflickr.com/600/300/developer?lock=5',
      },
      {
        name: 'Scripts',
        href: '/products?category=development',
        imageSrc: 'https://loremflickr.com/600/300/software?lock=6',
      },
    ],
  },
  // 5. Audio & Music
  {
    label: 'Audio & Music',
    value: 'audio' as const,
    featured: [
      {
        name: 'Sound Effects',
        href: `/products?category=audio`,
        imageSrc: 'https://loremflickr.com/600/300/sound,wave?lock=7',
      },
      {
        name: 'Royalty Free Music',
        href: '/products?category=audio&sort=desc',
        imageSrc: 'https://loremflickr.com/600/300/music,studio?lock=8',
      },
      {
        name: 'Instrumentals',
        href: '/products?category=audio',
        imageSrc: 'https://loremflickr.com/600/300/instrument?lock=9',
      },
    ],
  },
  // 6. E-Books & Learning
  {
    label: 'E-Books & Learning',
    value: 'education' as const,
    featured: [
      {
        name: 'Design Guides',
        href: `/products?category=education`,
        imageSrc: 'https://loremflickr.com/600/300/book,design?lock=10',
      },
      {
        name: 'Programming',
        href: '/products?category=education&sort=desc',
        imageSrc: 'https://loremflickr.com/600/300/learning,code?lock=11',
      },
      {
        name: 'Marketing',
        href: '/products?category=education',
        imageSrc: 'https://loremflickr.com/600/300/marketing?lock=12',
      },
    ],
  },
  // 7. Business & Productivity
  {
    label: 'Business & Productivity',
    value: 'business' as const,
    featured: [
      {
        name: 'Document Templates',
        href: `/products?category=business`,
        imageSrc: 'https://loremflickr.com/600/300/document,paper?lock=13',
      },
      {
        name: 'Presentations',
        href: '/products?category=business&sort=desc',
        imageSrc: 'https://loremflickr.com/600/300/presentation?lock=14',
      },
      {
        name: 'Spreadsheets',
        href: '/products?category=business',
        imageSrc: 'https://loremflickr.com/600/300/chart,graph?lock=15',
      },
    ],
  },
  // 8. Video & Motion Assets
  {
    label: 'Video & Motion Assets',
    value: 'video' as const,
    featured: [
      {
        name: 'Transitions',
        href: `/products?category=video`,
        imageSrc: 'https://loremflickr.com/600/300/video,editing?lock=16',
      },
      {
        name: 'Stock Footage',
        href: '/products?category=video&sort=desc',
        imageSrc: 'https://loremflickr.com/600/300/film,camera?lock=17',
      },
      {
        name: 'Motion Graphics',
        href: '/products?category=video',
        imageSrc: 'https://loremflickr.com/600/300/motion,graphic?lock=18',
      },
    ],
  },
  // 9. 3D & Game Assets
  {
    label: '3D & Game Assets',
    value: '3d_game' as const,
    featured: [
      {
        name: '3D Models',
        href: `/products?category=3d_game`,
        imageSrc: 'https://loremflickr.com/600/300/3d,render?lock=19',
      },
      {
        name: 'Game Sprites',
        href: '/products?category=3d_game&sort=desc',
        imageSrc: 'https://loremflickr.com/600/300/game,pixel?lock=20',
      },
      {
        name: 'Environments',
        href: '/products?category=3d_game',
        imageSrc: 'https://loremflickr.com/600/300/virtual,world?lock=21',
      },
    ],
  },
  // 10. AI & Prompt Packs
  {
    label: 'AI & Prompt Packs',
    value: 'ai_prompts' as const,
    featured: [
      {
        name: 'Midjourney Prompts',
        href: `/products?category=ai_prompts`,
        imageSrc: 'https://loremflickr.com/600/300/ai,robot?lock=22',
      },
      {
        name: 'ChatGPT Prompts',
        href: '/products?category=ai_prompts&sort=desc',
        imageSrc: 'https://loremflickr.com/600/300/artificial,intelligence?lock=23',
      },
      {
        name: 'Generative Art',
        href: '/products?category=ai_prompts',
        imageSrc: 'https://loremflickr.com/600/300/generative,art?lock=24',
      },
    ],
  },
]
