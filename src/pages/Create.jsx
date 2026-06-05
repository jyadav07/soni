import { Link } from 'react-router-dom'

export default function Create() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <h1 className="text-[22px] font-medium text-shoppi-ink">Create new item</h1>
      <Link
        to="/create"
        className="mt-6 rounded-full px-6 py-3 text-sm font-medium text-white hover:opacity-80"
        style={{ background: '#E8651A' }}
      >
        Get started
      </Link>
    </div>
  )
}
