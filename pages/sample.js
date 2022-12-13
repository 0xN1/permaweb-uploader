import { useEffect, useState } from 'react'

const sample = () => {
    const [data, setData] = useState(null)

    const hello = async () => {
        const data = await fetch('/api/hello')
        return data.json()
    }

    useEffect(() => {
        hello().then((data) => setData(data))
    }, [])

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 font-inter">
            <span className="text-2xl font-bold">sample text here</span>
            <span>add more content</span>
            <span>{data && data?.name}</span>
        </div>
    )
}

export default sample
