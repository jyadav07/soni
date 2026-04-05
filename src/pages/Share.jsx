import { useParams } from 'react-router-dom'

export default function Share() {
  const { slug } = useParams()

  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-semibold">Shared: {slug}</h1>
    </div>
  )
}
