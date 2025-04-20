import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard or auth page depending on auth status
    router.push('/DashboardPage')
  }, [])

  return null // or a loading spinner if you prefer
}
