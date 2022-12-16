import '../styles/globals.css'
import Web3Provider from '@/components/Web3Provider'
import MainLayout from '@/layout/MainLayout'

const MyApp = ({ Component, pageProps }) => {
    return (
        <Web3Provider>
            <MainLayout>
                <Component {...pageProps} />
            </MainLayout>
        </Web3Provider>
    )
}

export default MyApp
