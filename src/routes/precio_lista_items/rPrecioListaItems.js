import { Router } from "express"
import controller from "./cPrecioListaItems.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vPrecioListaItems',
        'vCompraPedidos_crear', 'vCompraPedidos_editar', 'vCompraPedidos_ingresarMercaderia',
        'vCompras_crear',
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso(['vPrecioListaItems_crear']),
    controller.create
)

router.patch(
    '/:id',
    verifyPermiso(['vPrecioListaItems_editar']),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso(['vPrecioListaItems_eliminar']),
    controller.delet
)

export default router