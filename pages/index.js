import { APP_NAME } from '@/lib/constants'
import Head from 'next/head'
import { ConnectKitButton } from 'connectkit'
import Link from 'next/link'

const Home = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-stone-100 font-inter">
            <Head>
                <title>Next Starter</title>
                <link rel="icon" href="/mono.svg" />
            </Head>
            {/* <div className="m-4 flex flex-col items-center">
                <ConnectKitButton />
            </div> */}

            <div className="flex select-none flex-col text-center text-6xl font-bold">
                {APP_NAME}
                <Link
                    className="m-5 mx-auto rounded-full bg-green-400 py-2 px-4 text-3xl shadow-xl"
                    href="/uploader"
                >
                    Uploader
                </Link>
            </div>
        </div>
    )
}

export default Home
