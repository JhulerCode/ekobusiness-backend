import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import multer from 'multer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const pathUploads = path.join(__dirname, '..', '..', 'uploads')

const storageUploads = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(pathUploads)) fs.mkdirSync(pathUploads, { recursive: true })
        cb(null, pathUploads)
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now()
        const uniqueName = `${timestamp}-${file.originalname}`
        cb(null, uniqueName)
    }
})

const upload = multer({ storage: storageUploads })

function deleteFile(name) {
    try {
        fs.unlinkSync(path.join(pathUploads, name))
    }
    catch (error) {
        console.log(error)
    }
}

function getFile(name) {
    const rutaArchivo = path.join(pathUploads, name)

    return fs.existsSync(rutaArchivo)
}

function getFilePath(name) {
    return path.join(pathUploads, name)
}

const uploadMem = multer({ storage: multer.memoryStorage() });

export {
    __dirname,
    pathUploads,
    upload,
    deleteFile,
    getFilePath,
    getFile,

    uploadMem,
}