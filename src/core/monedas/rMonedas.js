import { Router } from "express"
import controller from "./cMonedas.js"
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vMonedas:listar',
        'vPrecioListas:listar', 'vPrecioListas:crear', 'vPrecioListas:editar',
        'vCompraPedidos:listar', 'vCompraPedidos:crear', 'vCompraPedidos:ingresarMercaderia',
        'vCompras:listar', 'vCompras:crear',
        'vVentaPedidos:listar', 'vVentaPedidos:crear', 'vVentaPedidos:entregarMercaderia',
        'vVentas:listar', 'vVentas:crear',
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso(['vMonedas:crear']),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso(['vMonedas:editar']),
    controller.findById
)

router.patch(
    '/:id',
    verifyPermiso(['vMonedas:editar']),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso(['vMonedas:eliminar']),
    controller.delet
)

export default router