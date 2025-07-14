import { Router } from "express"
import controller from "./cPrecioListaItems.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vPrecioListaItems:listar',
        'vCompraPedidos:crear', 'vCompraPedidos:editar', 'vCompraPedidos:ingresarMercaderia',
        'vCompras:crear',
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso(['vPrecioListaItems:crear']),
    controller.create
)

router.patch(
    '/:id',
    verifyPermiso(['vPrecioListaItems:editar']),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso(['vPrecioListaItems:eliminar']),
    controller.delet
)

export default router