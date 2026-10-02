import { permanentRedirect } from 'next/navigation'

// OpDesk's own operator directory was retired: ZAtours is now the one public
// directory for operators (OpDesk customers show there as verified & bookable).
const ZATOURS_URL = (process.env.NEXT_PUBLIC_ZATOURS_URL || 'https://www.zatours.co.za').replace(/\/+$/, '')

export default function OperatorsDirectoryPage() {
  permanentRedirect(ZATOURS_URL)
}
