import { APP_NAME } from '@/lib/constants'
import { WagmiConfig, createClient } from 'wagmi'
import { ConnectKitProvider, getDefaultClient } from 'connectkit'

const alchemyId = process.env.ALCHEMY_ID

const client = createClient(
    getDefaultClient({
        appName: APP_NAME,
        alchemyId,
        autoConnect: true,
    }),
)

const Web3Provider = ({ children }) => {
    return (
        <WagmiConfig client={client}>
            <ConnectKitProvider client={client}>{children}</ConnectKitProvider>
        </WagmiConfig>
    )
}

export default Web3Provider
