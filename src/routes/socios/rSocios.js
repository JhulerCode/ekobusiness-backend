import { Router } from "express"
import controller from "./cSocios.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

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

router.post(
    '/',
    verifyPermiso([
        'vProveedores:crear',
        'vClientes:crear'
    ]),
    controller.create
)

router.patch(
    '/:id',
    verifyPermiso([
        'vProveedores:editar',
        'vClientes:editar'
    ]),
    controller.update
)

router.get(
    '/uno/:id',
    verifyPermiso([
        'vProveedores:ver', 'vProveedores:editar',
        'vClientes:ver', 'vClientes:editar'
    ]),
    controller.findById
)

router.delete(
    '/:id',
    verifyPermiso([
        'vProveedores:eliminar',
        'vClientes:eliminar'
    ]),
    controller.delet
)

router.patch(
    '/bulk/:id',
    verifyPermiso(['vProveedores:editarBulk']),
    controller.updateBulk
)

router.delete(
    '/bulk/:id',
    verifyPermiso(['vProveedores:eliminarBulk']),
    controller.deleteBulk
)

export default router