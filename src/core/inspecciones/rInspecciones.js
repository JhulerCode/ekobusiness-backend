import { Router } from "express"
import controller from "./cInspecciones.js"
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso(['vInspecciones:listar']),
    controller.find
)

router.post(
    '/',
    verifyPermiso(['vInspecciones:crear']),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso(['vInspecciones:ver', 'vInspecciones:editar']),
    controller.findById
)

router.patch(
    '/:id',
    verifyPermiso(['vInspecciones:editar']),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso(['vInspecciones:eliminar']),
    controller.delet
)


export default router