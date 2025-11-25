import { Router } from "express"
import controller from "./cCajaMovimientos.js"
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso(['vCajaMovimientos:listar']),
    controller.find
)

router.post(
    '/',
    verifyPermiso(['vCajaMovimientos:crear']),
    controller.create
)

router.patch(
    '/:id',
    verifyPermiso(['vCajaMovimientos:editar']),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso(['vCajaMovimientos:eliminar']),
    controller.delet
)

export default router