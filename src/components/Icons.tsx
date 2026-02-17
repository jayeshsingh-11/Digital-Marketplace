import { LucideProps } from 'lucide-react'

export const Icons = {
  logo: (props: LucideProps) => (
    <svg {...props} viewBox='0 0 100 100' fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" />
      <path d="M50 20C50 20 75 35 75 50C75 65 50 80 50 80" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      <path d="M50 20C50 20 25 35 25 50C25 65 50 80 50 80" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      <path d="M50 50L50 80" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
    </svg>
  ),
  mobileMenu: (props: LucideProps) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6c0 0 2.2-2 5-2s5 2 5 2 2.2 2 5 2 5-2 5-2" />
      <path d="M4 12c0 0 2.2-2 5-2s5 2 5 2 2.2 2 5 2 5-2 5-2" />
      <path d="M4 18c0 0 2.2-2 5-2s5 2 5 2 2.2 2 5 2 5-2 5-2" />
    </svg>
  ),
}
