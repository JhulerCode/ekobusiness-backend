import { Router } from "express"
import controller from "./cTipoCambios.js"
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vTipoCambios:listar',
        'vVentas:crear',
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso(['vTipoCambios:crear']),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso(['vTipoCambios_ver', 'vTipoCambios:editar']),
    controller.findById
)

router.patch(
    '/:id',
    verifyPermiso(['vTipoCambios:editar']),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso(['vTipoCambios:eliminar']),
    controller.delet
)

export default router