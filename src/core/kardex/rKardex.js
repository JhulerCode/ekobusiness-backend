import { Router } from "express"
import controller from "./cKardex.js"
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso(),
    controller.find
)

router.post(
    '/',
    verifyPermiso([
        'vArticulos:ajusteStock',
        'vProductosTerminados:ajusteStock',

        'vPrograma:salidaInsumos',
        // 'vProgramaGranel:salidaInsumos',
        // 'vProgramaLuxury:salidaInsumos',
        'vProduccionHistorial:salidaInsumos',

        'vPrograma:productosTerminados',
        // 'vProgramaGranel:productosTerminados',
        // 'vProgramaLuxury:productosTerminados',
        // 'vProduccionHistorial:productosTerminados',

        'vPrograma:salidaInsumosCompartidos',
    ]),
    controller.create
)

router.patch(
    '/:id',
    verifyPermiso([
        'vPrograma:productosTerminados',
        // 'vProgramaGranel:productosTerminados',
        // 'vProgramaLuxury:productosTerminados',
        // 'vProduccionHistorial:productosTerminados',
    ]),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso([
        'vPrograma:salidaInsumos',
        // 'vProgramaGranel:salidaInsumos',
        // 'vProgramaLuxury:salidaInsumos',
        'vProduccionHistorial:salidaInsumos',

        'vPrograma:productosTerminados',
        // 'vProgramaGranel:productosTerminados',
        // 'vProgramaLuxury:productosTerminados',
        'vProduccionHistorial:productosTerminados',

        'vPrograma:salidaInsumosCompartidos',
    ]),
    controller.delet
)


///// ----- LOTES ----- /////
router.get(
    '/lotes/:id',
    verifyPermiso([
        'vArticulos:ajusteStock',
        'vProductosTerminados:ajusteStock',
        'vVentaPedidos:entregarMercaderia',
        'vVentas:crear',

        'vPrograma:salidaInsumos',
        // 'vProgramaGranel:salidaInsumos',
        // 'vProgramaLuxury:salidaInsumos',
        'vProduccionHistorial:salidaInsumos',

        'vPrograma:salidaInsumosCompartidos',
    ]),
    controller.findLotes
)



///// ----- PARA PRODUCCION PRODUCTOS ----- /////
router.post(
    '/produccion-productos-terminados',
    verifyPermiso([
        'vPtsIngresos:listar'
    ]),
    controller.ingresarProduccionProductos
)



///// ----- PARA PRODUCCIÓN ----- /////
router.get(
    '/produccion/:linea&:f1&:f2',
    controller.findReporteProduccion
)


//--- Inventario hasta fecha ---///
router.get(
    '/inventario',
    verifyPermiso([
        'vInventarioArticulos:listar',
        'vInventarioProductos:listar',
    ]),
    controller.findInventario
)


//--- PONER BIEN EL STOCK EN LOTES PADRE ---//
router.post(
    '/recalcular-stock',
    controller.recalcularStock
)

export default router