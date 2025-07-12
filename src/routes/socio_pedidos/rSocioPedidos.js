import { Router } from "express"
import controller from "./cSocioPedidos.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vCompraPedidos',
        'vVentaPedidos',
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso([
        'vCompraPedidos_crear',
        'vVentaPedidos_crear',
    ]),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso([
        'vCompraPedidos_ver', 'vCompraPedidos_editar', 'vCompraPedidos_generarPdf', 'vCompraPedidos_ingresarMercaderia',
        'vVentaPedidos_ver', 'vVentaPedidos_editar', 'vVentaPedidos_entregarMercaderia',
    ]),
    controller.findById
)

router.patch(
    '/:id',
    verifyPermiso([
        'vCompraPedidos_editar',
        'vVentaPedidos_editar',
    ]),
    controller.update
)

// router.delete(
//     '/:id',
//     controller.delet
// )

router.patch(
    '/anular/:id',
    verifyPermiso([
        'vCompraPedidos_anular',
        'vVentaPedidos_anular',
    ]),
    controller.anular
)

router.get(
    '/pendientes',
    verifyPermiso([
        'vVentaPedidos_verProductosPedidos',
        'vProgramaFiltrantes_verProductosPedidos',
        'vProgramaGranel_verProductosPedidos',
        'vProgramaLuxury_verProductosPedidos',
    ]),
    controller.findDetail
)

export default router