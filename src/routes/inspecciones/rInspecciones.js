import { Router } from "express"
import controller from "./cInspecciones.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso(['vInspecciones']),
    controller.find
)

router.post(
    '/',
    verifyPermiso(['vInspecciones_crear']),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso(['vInspecciones_ver', 'vInspecciones_editar']),
    controller.findById
)

router.patch(
    '/:id',
    verifyPermiso(['vInspecciones_editar']),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso(['vInspecciones_eliminar']),
    controller.delet
)


export default router