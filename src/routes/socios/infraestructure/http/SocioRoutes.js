import { Router } from "express"
import controller from "./SocioControllers.js"
import verifyPermiso from '../../../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vProveedores:listar',
        'vCompraPedidos:listar', 'vCompraPedidos:crear', 'vCompraPedidos:ingresarMercaderia',
        'vCompras:listar', 'vCompras:crear',
        'vCompraItems:listar',
        'vClientes:listar',
        'vVentaPedidos', 'vVentaPedidos:crear', 'vVentaPedidos:entregarMercaderia', 'vVentaPedidos:verProductosPedidos',
        'vVentas:listar', 'vVentas:crear',
        'vInspecciones:crear', 'vInspecciones:editar',
    ]),
    controller.find
)

router.get(
    '/uno/:id',
    verifyPermiso([
        'vProveedores:ver', 'vProveedores:editar',
        'vClientes:ver', 'vClientes:editar'
    ]),
    controller.findById
)

export default router