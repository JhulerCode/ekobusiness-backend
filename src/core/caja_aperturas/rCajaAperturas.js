import { Router } from "express"
import controller from "./cCajaAperturas.js"
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso(['vCajaAperturas:listar']),
    controller.find
)

router.post(
    '/',
    verifyPermiso(['vCajaAperturas:aperturarCaja']),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso([
        'vCajaAperturas:ver',
        'vCajaAperturas:cerrarCaja',
        'vCajaMovimientos:listar',
    ]),
    controller.findById
)

router.patch(
    '/:id',
    verifyPermiso(['vCajaAperturas:cerrarCaja']),
    controller.cerrar
)

router.delete(
    '/:id',
    verifyPermiso(['vCajaAperturas:eliminar']),
    controller.delet
)

export default router