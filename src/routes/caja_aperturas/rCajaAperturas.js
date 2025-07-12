import { Router } from "express"
import controller from "./cCajaAperturas.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso(['vCajaAperturas']),
    controller.find
)

router.post(
    '/',
    verifyPermiso(['vCajaAperturas_aperturarCaja']),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso([
        'vCajaAperturas_ver',
        'vCajaAperturas_cerrarCaja',
        'vCajaMovimientos',
    ]),
    controller.findById
)

router.patch(
    '/:id',
    verifyPermiso(['vCajaAperturas_cerrarCaja']),
    controller.cerrar
)

router.delete(
    '/:id',
    verifyPermiso(['vCajaAperturas_eliminar']),
    controller.delet
)

export default router