import { Router } from "express"
import controller from "./cSocios.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vProveedores',
        'vCompraPedidos', 'vCompraPedidos_crear', 'vCompraPedidos_ingresarMercaderia',
        'vCompras', 'vCompras_crear',
        'vCompraItems',
        'vClientes',
        'vVentaPedidos', 'vVentaPedidos_crear', 'vVentaPedidos_entregarMercaderia', 'vVentaPedidos_verProductosPedidos',
        'vVentas', 'vVentas_crear',
        'vInspecciones_crear', 'vInspecciones_editar',
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso([
        'vProveedores_crear',
        'vClientes_crear'
    ]),
    controller.create
)

router.patch(
    '/:id',
    verifyPermiso([
        'vProveedores_editar',
        'vClientes_editar'
    ]),
    controller.update
)

router.get(
    '/uno/:id',
    verifyPermiso([
        'vProveedores_editar',
        'vClientes_editar'
    ]),
    controller.findById
)

router.delete(
    '/:id',
    verifyPermiso([
        'vProveedores_eliminar',
        'vClientes_eliminar'
    ]),
    controller.delet
)

router.patch(
    '/bulk/:id',
    verifyPermiso(['vProveedores_editarBulk']),
    controller.updateBulk
)

router.delete(
    '/bulk/:id',
    verifyPermiso(['vProveedores_eliminarBulk']),
    controller.deleteBulk
)

export default router