import { useParams } from 'react-router-dom'

export default function Share() {
  const { slug } = useParams()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-stash-silver">Shared link</p>
      <h1 className="text-2xl font-semibold text-stash-ink">{slug}</h1>
    </div>
  )
}
