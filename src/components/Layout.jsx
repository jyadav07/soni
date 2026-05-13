import Nav from './Nav'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main>{children}</main>
    </div>
  )
}
