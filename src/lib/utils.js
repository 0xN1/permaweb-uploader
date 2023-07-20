export const formatSize = (size) => {
    let blobSize = size / 1024

    if (size < 1024) {
        blobSize = blobSize * (1024).toFixed(2) + ' bytes'
    }
    if (size < 1048576 && size > 1024) {
        blobSize = blobSize.toFixed(2) + ' Kb'
    }

    if (size > 1048576) {
        blobSize = size / 1048576
        blobSize = blobSize.toFixed(2) + ' Mb'
    }

    if (size > 1073741824) {
        blobSize = size / 1073741824
        blobSize = blobSize.toFixed(2) + ' Gb'
    }

    return blobSize
}

export const copyToClipboard = (str) => {
    const el = document.createElement('textarea')
    el.value = str
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
}
