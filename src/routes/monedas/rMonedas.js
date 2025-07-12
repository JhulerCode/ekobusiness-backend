import { Router } from "express"
import controller from "./cMonedas.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vMonedas',
        'vPrecioListas', 'vPrecioListas_crear', 'vPrecioListas_editar',
        'vCompraPedidos', 'vCompraPedidos_crear', 'vCompraPedidos_ingresarMercaderia',
        'vCompras', 'vCompras_crear',
        'vVentaPedidos', 'vVentaPedidos_crear', 'vVentaPedidos_entregarMercaderia',
        'vVentas', 'vVentas_crear',
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso(['vMonedas_crear']),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso(['vMonedas_editar']),
    controller.findById
)

router.patch(
    '/:id',
    verifyPermiso(['vMonedas_editar']),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso(['vMonedas_eliminar']),
    controller.delet
)

export default router