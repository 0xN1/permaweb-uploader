import '../styles/globals.css'
import Web3Provider from '@/components/Web3Provider'

const MyApp = ({ Component, pageProps }) => {
    return (
        <Web3Provider>
            <Component {...pageProps} />
        </Web3Provider>
    )
}

export default MyApp
