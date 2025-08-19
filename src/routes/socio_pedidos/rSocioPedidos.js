import { Router } from "express"
import controller from "./cSocioPedidos.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vCompraPedidos:listar',
        'vVentaPedidos:listar',
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso([
        'vCompraPedidos:crear',
        'vVentaPedidos:crear',
    ]),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso([
        'vCompraPedidos:ver', 'vCompraPedidos:editar', 'vCompraPedidos:generarPdf', 'vCompraPedidos:ingresarMercaderia',
        'vVentaPedidos:ver', 'vVentaPedidos:editar', 'vVentaPedidos:entregarMercaderia',
    ]),
    controller.findById
)

router.patch(
    '/:id',
    verifyPermiso([
        'vCompraPedidos:editar',
        'vVentaPedidos:editar',
    ]),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso([
        'vCompraPedidos:eliminar',
        'vVentaPedidos:eliminar',
    ]),
    controller.delet
)

router.patch(
    '/anular/:id',
    verifyPermiso([
        'vCompraPedidos:anular',
        'vVentaPedidos:anular',
    ]),
    controller.anular
)

router.patch(
    '/terminar/:id',
    verifyPermiso([
        'vCompraPedidos:terminar',
        'vVentaPedidos:terminar',
    ]),
    controller.terminar
)

router.get(
    '/pendientes',
    verifyPermiso([
        'vVentaPedidos:verProductosPedidos',
        'vProgramaFiltrantes:verProductosPedidos',
        'vProgramaGranel:verProductosPedidos',
        'vProgramaLuxury:verProductosPedidos',
    ]),
    controller.findDetail
)

export default router