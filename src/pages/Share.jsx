import { useParams } from 'react-router-dom'

export default function Share() {
  const { slug } = useParams()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <p className="mb-2 text-[11px] font-medium tracking-widest" style={{ color: '#C0C0C0' }}>Shared link</p>
      <h1 className="text-[22px] font-medium text-shoppi-ink">{slug}</h1>
    </div>
  )
}
