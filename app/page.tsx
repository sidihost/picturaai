import { Navbar } from '@/components/pictura/navbar'
import { Landing } from '@/components/pictura/landing'
import { Footer } from '@/components/pictura/footer'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Landing />
      </main>
      <Footer />
    </>
  )
}
