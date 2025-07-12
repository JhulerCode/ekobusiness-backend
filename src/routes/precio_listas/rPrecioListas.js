import { Router } from "express"
import controller from "./cPrecioListas.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vPrecioListas',
        'vProveedores', 'vProveedores_crear', 'vProveedores_editar', 'vProveedores_editarBulk',
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso(['vPrecioListas_crear']),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso(['vPrecioListas_editar']),
    controller.findById
)

router.patch(
    '/:id',
    verifyPermiso(['vPrecioListas_editar']),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso(['vPrecioListas_eliminar']),
    controller.delet
)

export default router