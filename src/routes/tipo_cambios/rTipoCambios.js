import { Router } from "express"
import controller from "./cTipoCambios.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vTipoCambios',
        'vVentas_crear',
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso(['vTipoCambios_crear']),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso(['vTipoCambios_ver', 'vTipoCambios_editar']),
    controller.findById
)

router.patch(
    '/:id',
    verifyPermiso(['vTipoCambios_editar']),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso(['vTipoCambios_eliminar']),
    controller.delet
)

export default router