import { Router } from "express"
import controller from "./cEmpresas.js"
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/uno/:id',
    controller.findById
)

router.patch(
    '/:id',
    verifyPermiso([
        'vEmpresa:editar'
    ]),
    controller.update
)

export default router