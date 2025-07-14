import { Router } from "express"
import controller from "./cPrecioListas.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vPrecioListas:listar',
        'vProveedores:listar', 'vProveedores:crear', 'vProveedores:editar', 'vProveedores:editarBulk',
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso(['vPrecioListas:crear']),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso(['vPrecioListas:editar']),
    controller.findById
)

router.patch(
    '/:id',
    verifyPermiso(['vPrecioListas:editar']),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso(['vPrecioListas:eliminar']),
    controller.delet
)

export default router