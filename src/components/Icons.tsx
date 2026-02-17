import { LucideProps } from 'lucide-react'

export const Icons = {
  logo: (props: LucideProps) => (
    <svg {...props} viewBox='0 0 200 80' fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="100" y="45" fontFamily="Brush Script MT, cursive" fontSize="40" fill="currentColor" textAnchor="middle" fontStyle="italic">Creative</text>
      <text x="100" y="70" fontFamily="Arial, sans-serif" fontSize="14" fill="currentColor" textAnchor="middle" letterSpacing="0.4em" fontWeight="bold">CASCADE</text>
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
