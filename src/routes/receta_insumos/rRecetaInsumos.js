import { Router } from "express"
import controller from "./cRecetaInsumos.js"
import verifyPermiso from "../../middlewares/verifyPermiso.js"

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vReceta:listar',
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso(['vReceta:crear']),
    controller.create
)

router.patch(
    '/:id',
    verifyPermiso(['vReceta:editar']),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso(['vReceta:eliminar']),
    controller.delet
)

export default router