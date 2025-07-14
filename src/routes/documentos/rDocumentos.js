import { Router } from "express"
import controller from "./cDocumentos.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

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

// router.patch(
//     '/uploadDoc/:id',
//     controller.uploadDoc
// )

export default router