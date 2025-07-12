import { Router } from "express"
import controller from "./cCajaMovimientos.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso(['vCajaMovimientos']),
    controller.find
)

router.post(
    '/',
    verifyPermiso(['vCajaMovimientos_crear']),
    controller.create
)

router.patch(
    '/:id',
    verifyPermiso(['vCajaMovimientos_editar']),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso(['vCajaMovimientos_eliminar']),
    controller.delet
)

export default router