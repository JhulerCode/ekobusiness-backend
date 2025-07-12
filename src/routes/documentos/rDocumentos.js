import { Router } from "express"
import controller from "./cDocumentos.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vRegistrosSanitarios',
        'vDocumentos',
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso([
        'vRegistrosSanitarios_crear',
        'vDocumentos_crear',
    ]),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso([
        'vRegistrosSanitarios_editar',
        'vDocumentos_editar',
    ]),
    controller.findById
)

router.patch(
    '/:id',
    verifyPermiso([
        'vRegistrosSanitarios_editar',
        'vDocumentos_editar',
    ]),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso([
        'vRegistrosSanitarios_eliminar',
        'vDocumentos_eliminar',
    ]),
    controller.delet
)

// router.patch(
//     '/uploadDoc/:id',
//     controller.uploadDoc
// )

export default router