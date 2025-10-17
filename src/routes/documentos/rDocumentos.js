import { Router } from "express"
import controller from "./cDocumentos.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'
import { uploadMem } from '../../utils/uploadFiles.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vRegistrosSanitarios:listar',
        'vDocumentos:listar',
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso([
        'vRegistrosSanitarios:crear',
        'vDocumentos:crear',
    ]),
    uploadMem.single('archivo'),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso([
        'vRegistrosSanitarios:editar',
        'vDocumentos:editar',
    ]),
    controller.findById
)

router.patch(
    '/:id',
    verifyPermiso([
        'vRegistrosSanitarios:editar',
        'vDocumentos:editar',
    ]),
    uploadMem.single('archivo'),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso([
        'vRegistrosSanitarios:eliminar',
        'vDocumentos:eliminar',
    ]),
    controller.delet
)

router.get(
    '/uploads/:id',
    controller.verfile
)

export default router