import { useEffect, useRef, useState } from 'react'
import { FilePond, registerPlugin } from 'react-filepond'
import { WebBundlr } from '@bundlr-network/client'
import { utils } from 'ethers'

import { useAutoAnimate } from '@formkit/auto-animate/react'

import 'filepond/dist/filepond.min.css'

import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import {
    useAccount,
    useNetwork,
    useProvider,
    useSigner,
    useSwitchNetwork,
} from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import useLocalStorage from '@/hooks/use-local-storage'
import { copyToClipboard, formatSize } from '@/lib/utils'

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview)

const Home = () => {
    const [filesData, setFilesData] = useState([])
    const [files, setFiles] = useState([])
    const [file, setFile] = useState(null)
    const [bundlrInstance, setBundlrInstance] = useState(null)
    const [balance, setBalance] = useState(0)
    const [acc, setAcc] = useState(null)
    const [price, setPrice] = useState(0)
    const [filesURI, setFilesURI] = useState([])
    const [topupAmount, setTopupAmount] = useState(1)

    const [error, setError] = useState(null)
    const [parent, enableAnimations] = useAutoAnimate()

    const [history, setHistory] = useLocalStorage('history', [])

    const { switchNetwork } = useSwitchNetwork({
        throwForSwitchChainNotSupported: true,
    })
    const connectKitProvider = useProvider()
    const { isConnected } = useAccount()
    const { chain } = useNetwork()

    const { data: connectKitSigner } = useSigner()

    const currentChainId = chain?.id
    const desiredChainId = 137 // Polygon Mainnet
    const currency = 'matic'

    const bundlrRef = useRef()

    async function initBundlr() {
        connectKitProvider.getSigner = () => connectKitSigner
        const bundlr = new WebBundlr(
            'https://node1.bundlr.network',
            'matic',
            connectKitProvider,
            {
                providerUrl: 'https://polygon-rpc.com/',
            },
        )

        try {
            await bundlr.ready()
        } catch (err) {
            console.log(err)
            setError(err)
        }

        if (!bundlr.address) {
            console.log('something went wrong')
            setError('something went wrong')
        }

        setAcc(bundlr?.address)
        setBundlrInstance(bundlr)
        bundlrRef.current = bundlr
        fetchBalance()
    }

    useEffect(() => {
        if (connectKitProvider && connectKitSigner) {
            if (currentChainId !== desiredChainId && switchNetwork !== null) {
                switchNetwork(desiredChainId)
            }
        }
    }, [])

    useEffect(() => {
        if (currentChainId !== desiredChainId && switchNetwork !== null) {
            switchNetwork(desiredChainId)
        }
    }, [currentChainId])

    async function fetchBalance() {
        const bal = await bundlrRef.current.getLoadedBalance()
        setBalance(utils.formatEther(bal.toString()))
    }

    const handlePrice = async () => {
        if (files.length > 0) {
            const price = await bundlrInstance?.utils.getPrice(
                currency,
                files[0].file.size,
            )
            setPrice(price?.toString())
        }
    }

    const handleDownload = () => {
        const csv = filesData.map((file, index) => {
            return {
                name: file.name,
                size: file.size,
                type: file.type,
                uri: filesURI[index],
            }
        })

        const csvRows = []
        const headers = Object.keys(csv[0])
        csvRows.push(headers.join(','))
        for (const row of csv) {
            const values = headers.map((header) => {
                const escaped = ('' + row[header]).replace(/"/g, '\\"')
                return `${escaped}`
            })
            csvRows.push(values.join(','))
        }
        const csvContent = csvRows.join('\n')
        const csvURI = 'data:text/csv;charset=utf-8,' + csvContent
        const encodedUri = encodeURI(csvURI)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', Date.now() + '_uploadr.csv')
        document.body.appendChild(link)
        link.click()
    }

    const handleHistoryDownload = () => {
        const csv = history.map((file, index) => {
            return {
                name: file.name,
                size: file.size,
                type: file.type,
                uri: file.uri,
            }
        })

        const csvRows = []
        const headers = Object.keys(csv[0])
        csvRows.push(headers.join(','))
        for (const row of csv) {
            const values = headers.map((header) => {
                const escaped = ('' + row[header]).replace(/"/g, '\\"')
                return `${escaped}`
            })
            csvRows.push(values.join(','))

            const csvContent = csvRows.join('\n')
            const csvURI = 'data:text/csv;charset=utf-8,' + csvContent
            const encodedUri = encodeURI(csvURI)
            const link = document.createElement('a')
            link.setAttribute('href', encodedUri)
            link.setAttribute('download', Date.now() + '_uploadr_history.csv')
            document.body.appendChild(link)
            link.click()
        }
    }

    const handleSave = () => {
        const data = filesData.map((file, index) => {
            return {
                name: file.name,
                size: file.size,
                type: file.type,
                uri: filesURI[index],
            }
        })
        setHistory([...history, ...data])
    }

    async function handleClear() {
        setFilesData([])
        setFiles([])
        setFile(null)
        setFilesURI([])
    }

    async function handleTopup() {
        try {
            const amount = topupAmount
            const price = (await bundlrInstance.currencyConfig.base[1]) * amount
            const tx = await bundlrInstance?.fund(parseInt(price))
            console.log('topup tx:', tx)
            fetchBalance()
        } catch (error) {
            console.error(error)
            setError(error)
        }
    }

    useEffect(() => {
        handlePrice()
    }, [files])

    const handleUpload = async () => {
        if (files.length > 0) {
            const data = await file.result
            const tags = [
                {
                    name: 'Content-Type',
                    value: files[0].file.type
                        ? `${files[0].file.type}`
                        : 'application/octet-stream',
                },
            ]
            const tx = await bundlrInstance.createTransaction(data, {
                tags: tags,
            })

            await tx.sign()
            await tx.upload()
            if (filesURI.length > 0) {
                setFilesURI([...filesURI, `https://arweave.net/${tx.id}`])
            } else {
                setFilesURI([`https://arweave.net/${tx.id}`])
            }
            fetchBalance()
        }
    }

    if (!isConnected) {
        return (
            <div
                ref={parent}
                className="flex min-h-screen flex-col items-center justify-center bg-stone-100 p-32 font-inter"
            >
                <span className=" my-16 text-center text-9xl font-bold">
                    Uploadr
                </span>
                <ConnectKitButton />

                {history && history.length > 0 && (
                    <>
                        <Divider className="my-8 max-w-md border-zinc-200" />

                        <div className="flex flex-col gap-8 p-4 text-center">
                            <span className="text-4xl font-bold">History</span>
                            <div className="flex flex-col gap-2">
                                {history
                                    .filter(
                                        (file) =>
                                            file.uri !== null &&
                                            file.uri !== '' &&
                                            file.uri !== undefined,
                                    )
                                    .map((fileItem) => {
                                        return (
                                            <div
                                                key={fileItem.name}
                                                className="flex flex-row items-center justify-between gap-8"
                                            >
                                                <div className="flex-1 text-left">
                                                    <span className="text-xl">
                                                        {fileItem.name}
                                                    </span>
                                                </div>
                                                <span className="text-md">
                                                    {formatSize(fileItem.size)}
                                                </span>
                                                <div className="text-right">
                                                    <a
                                                        href={fileItem.uri}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <button className="rounded-3xl bg-blue-400 px-4 py-2 text-white shadow-xl active:shadow-sm">
                                                            🌐 View
                                                        </button>
                                                    </a>
                                                </div>
                                            </div>
                                        )
                                    })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        )
    }

    return (
        <div
            ref={parent}
            className="flex min-h-screen flex-col items-center justify-center bg-stone-100 p-32 font-inter"
        >
            <span className=" my-16 text-center text-9xl font-bold">
                Uploadr
            </span>
            <ConnectKitButton />

            {!bundlrInstance && currentChainId === desiredChainId && (
                <button
                    onClick={initBundlr}
                    className="m-5 mx-auto rounded-full
            bg-green-400 py-3 px-5 text-3xl font-bold shadow-xl active:shadow-sm"
                >
                    Proceed
                </button>
            )}

            {bundlrInstance && isConnected && (
                <div className="my-5 flex flex-col items-center gap-3 text-xl font-bold">
                    <span className="my-4 text-3xl">
                        💳 {parseFloat(balance).toFixed(4)}
                    </span>
                    <div className="flex flex-row items-center justify-between gap-4">
                        Topup{' '}
                        <input
                            type="number"
                            min={1}
                            max={100}
                            onChange={(e) => {
                                setTopupAmount(e.target.value)
                            }}
                            value={topupAmount}
                            className="w-16 rounded-full bg-transparent bg-slate-200 px-4 py-2 text-center text-xl outline-green-400"
                        />
                        <button
                            onClick={handleTopup}
                            className="rounded-full
                        bg-transparent py-2 px-4 text-xl outline-green-400 ring-2 ring-slate-200 hover:bg-slate-200 hover:shadow-sm"
                        >
                            🛒
                        </button>{' '}
                    </div>
                </div>
            )}
            <Divider className="max-w-md border-zinc-200" />

            <div className="flex flex-col items-center justify-center">
                {bundlrInstance && isConnected && (
                    <div className="mx-auto mt-5 w-96">
                        <FilePond
                            allowMultiple={false}
                            files={files}
                            storeAsFile={true}
                            credits={false}
                            onupdatefiles={(fileItems) => {
                                setFiles(fileItems)
                            }}
                            server={{
                                process: (
                                    fieldName,
                                    file,
                                    metadata,
                                    load,
                                    error,
                                ) => {
                                    if (filesData.length > 0) {
                                        setFilesData([...filesData, file])
                                    } else {
                                        setFilesData([file])
                                    }

                                    const reader = new FileReader()
                                    reader.onload = function () {
                                        load(reader.result)
                                    }
                                    const a = reader.readAsArrayBuffer(file)
                                    setFile(reader)
                                },
                            }}
                            labelIdle='Drag & Drop your file or <span class="filepond--label-action">Browse</span>'
                        />
                    </div>
                )}

                {bundlrInstance && files.length > 0 && (
                    <div className="flex flex-col items-center">
                        <span className="text-md font-bold">
                            Price:{' '}
                            {parseFloat(utils.formatEther(price)).toFixed(5)}{' '}
                            MATIC
                        </span>
                    </div>
                )}

                {files.length > 0 && (
                    <span className="m-2 break-words font-bold">
                        <button
                            onClick={handleUpload}
                            className="mx-4 mb-4 rounded-full bg-green-400 px-6 py-4 text-black shadow-xl active:shadow-sm"
                        >
                            🚀 Send to PermaWeb
                        </button>
                    </span>
                )}
            </div>

            {filesData && filesData.length > 0 && (
                <div className="m-4 flex flex-col text-center">
                    {/* <span className=" mb-6 text-4xl font-bold">History</span> */}
                    <div className="mx-auto flex flex-row gap-2 font-medium">
                        <button
                            className="text-md mx-auto mt-2 rounded-full bg-red-400 py-2 px-4 text-white shadow-xl active:shadow-sm"
                            onClick={handleClear}
                        >
                            🗑️ Clear All
                        </button>

                        <button
                            className="text-md mx-auto mt-2 rounded-full bg-orange-400 px-4 py-2 text-white shadow-xl active:shadow-sm"
                            onClick={handleDownload}
                        >
                            💾 Save CSV
                        </button>

                        <button
                            className="text-md mx-auto mt-2 rounded-full bg-blue-400 px-4 py-2 text-white shadow-xl active:shadow-sm"
                            onClick={handleSave}
                        >
                            💾 Save to History
                        </button>
                    </div>
                    <div className="m-4 flex flex-row text-xl">
                        {filesData && filesData.length > 0 && (
                            <ul className="flex-1 px-4 text-left">
                                {filesData &&
                                    filesData?.map((fileItem) => {
                                        return (
                                            <li
                                                key={fileItem.name}
                                                className="mt-2"
                                            >
                                                {fileItem &&
                                                    fileItem.name &&
                                                    fileItem.name.length < 20 &&
                                                    fileItem.name}
                                                {fileItem &&
                                                    fileItem.name &&
                                                    fileItem.name.length > 20 &&
                                                    fileItem.name.slice(0, 10) +
                                                        '...' +
                                                        fileItem.name.slice(
                                                            fileItem.name
                                                                .length - 10,
                                                            fileItem.name
                                                                .length,
                                                        )}
                                            </li>
                                        )
                                    })}
                            </ul>
                        )}
                        {filesURI.length > 0 && (
                            <ul className="px-4 text-right">
                                {filesURI.map((uri) => {
                                    return (
                                        <li
                                            key={uri}
                                            className="mt-2 underline"
                                        >
                                            <a
                                                href={uri}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Arweave Link
                                            </a>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {history && history.length > 0 && (
                <>
                    <Divider className="max-w-md border-zinc-200" />
                    <div className="flex flex-col items-center gap-8 p-4 text-center">
                        <span className="p-8 text-4xl font-bold">
                            Local History
                        </span>

                        <button
                            onClick={handleHistoryDownload}
                            className="-mt-8 max-w-sm rounded-3xl bg-blue-500 px-4 py-2 text-white shadow-xl active:shadow-sm"
                        >
                            💾 Save CSV
                        </button>

                        <div className="flex flex-col gap-2">
                            {history
                                .filter(
                                    (file) =>
                                        file.uri !== null &&
                                        file.uri !== '' &&
                                        file.uri !== undefined,
                                )
                                .map((fileItem) => {
                                    return (
                                        <div
                                            key={fileItem.name}
                                            className="flex flex-row items-center justify-between gap-8"
                                        >
                                            {fileItem.type.includes('image') ? (
                                                <img
                                                    src={fileItem.uri}
                                                    className="h-16 w-16 object-contain"
                                                />
                                            ) : (
                                                <img
                                                    src={`https://placehold.co/20x20/orange/white?text=${fileItem.type.slice(
                                                        '/',
                                                    )}`}
                                                    className="h-16 w-16 object-contain"
                                                />
                                            )}
                                            <div className="flex-1 text-left">
                                                <span className="text-xl">
                                                    {fileItem.name}
                                                </span>
                                            </div>
                                            <span className="text-md">
                                                {formatSize(fileItem.size)}
                                            </span>
                                            <div className="flex flex-row gap-4 text-right">
                                                <a
                                                    href={fileItem.uri}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <button className="rounded-3xl bg-indigo-600 px-4 py-2 text-white shadow-xl active:shadow-sm">
                                                        🌐 View
                                                    </button>
                                                </a>
                                                <button
                                                    onClick={() => {
                                                        copyToClipboard(
                                                            fileItem.uri,
                                                        )
                                                        alert(
                                                            `Copied link to clipboard: \n\n ${fileItem.uri}`,
                                                        )
                                                    }}
                                                    className="rounded-3xl bg-orange-400 px-4 py-2 text-white shadow-xl active:shadow-sm"
                                                >
                                                    📋 Copy
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default Home

const Divider = ({ className }) => {
    return (
        <span
            className={`h-4 w-full border-b-2 border-zinc-800 ${className}`}
        ></span>
    )
}
