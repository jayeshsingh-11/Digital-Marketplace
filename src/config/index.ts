export const PRODUCT_CATEGORIES = [
  {
    label: 'Graphics & Illustrations',
    value: 'graphics' as const,
    featured: [
      {
        name: 'Icons',
        href: `/products?category=graphics`,
        imageSrc: '/nav/icons/picks.jpg',
      },
      {
        name: 'Illustrations',
        href: '/products?category=graphics&sort=desc',
        imageSrc: '/nav/ui-kits/blue.jpg',
      },
      {
        name: 'Patterns',
        href: '/products?category=graphics',
        imageSrc: '/nav/ui-kits/purple.jpg',
      },
    ],
  },
  {
    label: 'Fonts',
    value: 'fonts' as const,
    featured: [
      {
        name: 'Serif',
        href: `/products?category=fonts`,
        imageSrc: 'https://loremflickr.com/600/300/typography?lock=1',
      },
      {
        name: 'Sans Serif',
        href: '/products?category=fonts&sort=desc',
        imageSrc: 'https://loremflickr.com/600/300/font?lock=2',
      },
      {
        name: 'Display',
        href: '/products?category=fonts',
        imageSrc: 'https://loremflickr.com/600/300/letters?lock=3',
      },
    ],
  },
  {
    label: 'Templates',
    value: 'templates' as const,
    featured: [
      {
        name: 'Social Media',
        href: `/products?category=templates`,
        imageSrc: 'https://loremflickr.com/600/300/instagram?lock=4',
      },
      {
        name: 'Presentations',
        href: '/products?category=templates&sort=desc',
        imageSrc: 'https://loremflickr.com/600/300/presentation?lock=5',
      },
      {
        name: 'Mockups',
        href: '/products?category=templates',
        imageSrc: 'https://loremflickr.com/600/300/mockup?lock=6',
      },
    ],
  },
  {
    label: 'Add-ons',
    value: 'addons' as const,
    featured: [
      {
        name: 'Procreate Brushes',
        href: `/products?category=addons`,
        imageSrc: 'https://loremflickr.com/600/300/drawing?lock=7',
      },
      {
        name: 'Photoshop Actions',
        href: '/products?category=addons&sort=desc',
        imageSrc: 'https://loremflickr.com/600/300/photoshop?lock=8',
      },
      {
        name: 'Lightroom Presets',
        href: '/products?category=addons',
        imageSrc: 'https://loremflickr.com/600/300/photo,edit?lock=9',
      },
    ],
  },
  {
    label: 'Photos',
    value: 'photos' as const,
    featured: [
      {
        name: 'People',
        href: `/products?category=photos`,
        imageSrc: 'https://loremflickr.com/600/300/people?lock=10',
      },
      {
        name: 'Nature',
        href: '/products?category=photos&sort=desc',
        imageSrc: 'https://loremflickr.com/600/300/nature?lock=11',
      },
      {
        name: 'Business',
        href: '/products?category=photos',
        imageSrc: 'https://loremflickr.com/600/300/business?lock=12',
      },
    ],
  },
  {
    label: 'Web Themes',
    value: 'web_themes' as const,
    featured: [
      {
        name: 'Shopify',
        href: `/products?category=web_themes`,
        imageSrc: 'https://loremflickr.com/600/300/website?lock=13',
      },
      {
        name: 'Wordpress',
        href: '/products?category=web_themes&sort=desc',
        imageSrc: 'https://loremflickr.com/600/300/wordpress?lock=14',
      },
      {
        name: 'Framer',
        href: '/products?category=web_themes',
        imageSrc: 'https://loremflickr.com/600/300/interface?lock=15',
      },
    ],
  },
  {
    label: '3D',
    value: '3d' as const,
    featured: [
      {
        name: 'Characters',
        href: `/products?category=3d`,
        imageSrc: 'https://loremflickr.com/600/300/3d,character?lock=16',
      },
      {
        name: 'Objects',
        href: '/products?category=3d&sort=desc',
        imageSrc: 'https://loremflickr.com/600/300/3d,object?lock=17',
      },
      {
        name: 'Textures',
        href: '/products?category=3d',
        imageSrc: 'https://loremflickr.com/600/300/texture?lock=18',
      },
    ],
  },
]
