const { spawn } = require('child_process')
const os = require('os').platform
const supportedPlatforms = ['linux', 'darwin']

const getMountFreeSpace = async (mountPoint = '/') => {
    if (!supportedPlatforms.includes(os())) throw new Error(`errorFreeSpace_UnsupportedPlatform_${os()}`)

    const readSystemFreeSpaceLine = (mountPoint) => {
        return new Promise((resolve, reject) => {
            let result
            const ls = spawn('df', ['-k']) // get data in kilobyte blocks
            ls.stdout.on('data', (data) => {
                if (!result) result = data
                else result += data
            })

            ls.on('close', (code) => {
                if (code) {
                    result = null
                    return reject(`errorFreeSpace_WithCode_${code}`)
                }

                result = result.toString().split('\n').filter(f => f.substr(-2) === ` ${mountPoint}`).join('') // ' /' is checked to make sure it points to root folder
                if (!result) return reject('errorFreeSpace_NoSuchMountPoint')

                resolve(result)
            })

            ls.on('error', () => {
                return reject('errorFreeSpace')
            })
        })
    }

    const parseFreeSpaceLine = (line) => {
        // const regex = /^(.+?)\s+(\d+\w+)\s+(\d+\w+)\s+(\d+\w+)\s+(\d+%)(:?\s+(\d+)\s+(\d+)\s+(\d+%))?\s+(.+)$/ // this parses -H parameter
        const regex = /^(.+?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)%\s+(?:(\d+)\s+(\d+)\s+(\d+)%\s+)?(.+)$/
        const parsed = regex.exec(line)
        const result = {
            fileSystem: parsed[1],
            size: +parsed[2] * 1024,
            used: +parsed[3] * 1024,
            available: +parsed[4] * 1024,
            usedInPercents: +parsed[5],
            mountedOn: parsed[parsed.length - 1]
        }

        if (os() === 'darwin') {
            result.darwin = {
                iused: +parsed[6],
                ifree: +parsed[7],
                iusedInPercents: parsed[8]
            }
        }

        return result
    }

    const line = await readSystemFreeSpaceLine(mountPoint)

    return parseFreeSpaceLine(line)
}

module.exports = {
    getMountFreeSpace,
}