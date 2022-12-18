import { APP_NAME } from '@/lib/constants'
import Link from 'next/link'

const Home = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-stone-100 font-inter">
            <div className="flex select-none flex-col text-center text-6xl font-bold">
                <span className="mb-4">PermaWeb</span>
                <Link
                    className="m-5 mx-auto rounded-full bg-green-400 py-3 px-5 text-3xl shadow-xl active:shadow-sm"
                    href="/uploader"
                >
                    Uploader
                </Link>
            </div>
        </div>
    )
}

export default Home
