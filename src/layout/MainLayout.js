import Head from 'next/head'
import { APP_NAME } from '@/lib/constants'

const MainLayout = ({ children }) => {
    return (
        <>
            <Head>
                <title>{APP_NAME}</title>
                <meta name="description" content="PermaWeb Uploader" />
                <link rel="icon" href="./mono.svg" type="image/svg+xml" />
            </Head>

            {children}
        </>
    )
}

export default MainLayout
