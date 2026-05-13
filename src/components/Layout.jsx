import Nav from './Nav'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <main>{children}</main>
    </div>
  )
}
