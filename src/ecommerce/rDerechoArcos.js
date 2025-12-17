import { Router } from "express"
import controller from "#core/derecho_arcos/cDerechoArcos.js"
import { uploadMem } from '#http/middlewares/uploadFiles.js'

const router = Router()

router.post(
    '/',
    uploadMem.fields([
        { name: 'doc_file', maxCount: 1 },
        { name: 'rep_doc_file', maxCount: 1 },
        { name: 'extras_doc', maxCount: 1 },
    ]),
    controller.create
)

export default router