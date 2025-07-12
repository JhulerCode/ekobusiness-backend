import { Router } from "express"
import controller from "./cRecetaInsumos.js"
import verifyPermiso from "../../middlewares/verifyPermiso.js"

const router = Router()

router.get(
    '/:id',
    verifyPermiso([
        'vReceta'
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso(['vReceta_crear']),
    controller.create
)

router.patch(
    '/:id',
    verifyPermiso(['vReceta_editar']),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso(['vReceta_eliminar']),
    controller.delet
)

export default router