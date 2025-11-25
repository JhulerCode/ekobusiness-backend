import { Router } from "express"
import controller from "./cAsistencias.js"
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso(['vAsistencias:listar']),
    controller.find
)

router.post(
    '/',
    verifyPermiso(['vAsistencias:crear']),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso(['vAsistencias:editar']),
    controller.findById
)

router.patch(
    '/:id',
    verifyPermiso(['vAsistencias:editar']),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso(['vAsistencias:eliminar']),
    controller.delet
)

export default router