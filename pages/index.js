import { APP_NAME } from '@/lib/constants'
import Head from 'next/head'
import { ConnectKitButton } from 'connectkit'

const Home = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-2 font-inter">
            <Head>
                <title>Next Starter</title>
                <link rel="icon" href="/mono.svg" />
            </Head>
            <div className="m-4 flex flex-col items-center">
                <ConnectKitButton />
            </div>

            <div className="mt-6 select-none text-center text-6xl font-bold">
                {APP_NAME}
            </div>
        </div>
    )
}

export default Home
