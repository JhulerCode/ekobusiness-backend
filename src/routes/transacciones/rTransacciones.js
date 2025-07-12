import { Router } from "express"
import controller from "./cTransacciones.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vCompras',
        'vVentas'
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso([
        'vCompraPedidos_ingresarMercaderia',
        'vCompras_crear',
        'vVentaPedidos_entregarMercaderia',
        'vVentas_crear',
    ]),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso([
        'vCompras_ver',
        'vVentas_ver',
    ]),
    controller.findById
)

// router.patch(
//     '/:id',
//     controller.update
// )

// router.delete(
//     '/:id',
//     controller.delet
// )

router.patch(
    '/anular/:id',
    verifyPermiso([
        'vCompras_anular',
        'vVentas_anular',
    ]),
    controller.anular
)

router.get(
    '/lotes/:id',
    verifyPermiso([
        'vArticulos_ajusteStock',
        'vProductosTerminados_ajusteStock',
        'vVentaPedidos_entregarMercaderia',
        'vVentas_crear',
        'vProgramaFiltrantes_salidaInsumos',
        'vProgramaGranel_salidaInsumos',
        'vProgramaLuxury_salidaInsumos',
        'vProduccionHistorial_salidaInsumos',
    ]),
    controller.findLotes
)

router.post(
    '/produccion-salida',
    verifyPermiso([
        'vProgramaFiltrantes_salidaInsumos',
        'vProgramaGranel_salidaInsumos',
        'vProgramaLuxury_salidaInsumos',
        'vProduccionHistorial_salidaInsumos',
    ]),
    controller.createProduccionSalida
)

router.get(
    '/items-produccion/:id',
    verifyPermiso([
        'vProgramaFiltrantes_salidaInsumos',
        'vProgramaGranel_salidaInsumos',
        'vProgramaLuxury_salidaInsumos',
        'vProduccionHistorial_salidaInsumos',
    ]),
    controller.findItemsProduccion
)

router.post(
    '/productos-terminados',
    verifyPermiso(['vPtsIngresos_ingresarPts']),
    controller.createProductosTerminados
)

router.get(
    '/productos-terminados',
    verifyPermiso(['']),
    controller.findProductosTerminados
)

router.get(
    '/kardex/:id',
    verifyPermiso([
        'vArticulos_kardex',
        'vProductosTerminados_kardex',
    ]),
    controller.findKardex
)

router.get(
    '/items',
    verifyPermiso([
        'vProduccionHistorial_productosTerminados',
    ]),
    controller.findItems
)

router.post(
    '/ajuste',
    verifyPermiso([
        'vArticulos_ajusteStock',
        'vProductosTerminados_ajusteStock',
    ]),
    controller.ajusteStock
)

export default router