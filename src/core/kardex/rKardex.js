import { Router } from 'express'
import controller from './cKardex.js'
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    // verifyPermiso([
    //     'vArticulos:ajusteStock',
    //     'vProductosTerminados:ajusteStock',
    //     'vVentaPedidos:entregarMercaderia',
    //     'vVentas:crear',

    //     'vPrograma:salidaInsumos',
    //     'vPrograma:salidaInsumosCompartidos',

    //     'vProduccionOrdenes:salidaInsumos',
    // ]),
    controller.find,
)

router.post(
    '/',
    verifyPermiso([
        'vArticulos:ajusteStock',
        'vProductosTerminados:ajusteStock',

        'vPrograma:salidaInsumos',
        'vProduccionOrdenes:salidaInsumos',

        'vPrograma:productosTerminados',
        'vProduccionOrdenes:productosTerminados',

        'vPrograma:salidaInsumosCompartidos',
    ]),
    controller.create,
)

router.patch(
    '/:id',
    verifyPermiso([
        'vPrograma:productosTerminados',
        // 'vProgramaGranel:productosTerminados',
        // 'vProgramaLuxury:productosTerminados',
        // 'vProduccionOrdenes:productosTerminados',
    ]),
    controller.update,
)

router.delete(
    '/:id',
    verifyPermiso([
        'vPrograma:salidaInsumos',
        // 'vProgramaGranel:salidaInsumos',
        // 'vProgramaLuxury:salidaInsumos',
        'vProduccionOrdenes:salidaInsumos',

        'vPrograma:productosTerminados',
        // 'vProgramaGranel:productosTerminados',
        // 'vProgramaLuxury:productosTerminados',
        'vProduccionOrdenes:productosTerminados',

        'vPrograma:salidaInsumosCompartidos',
    ]),
    controller.delet,
)

/////--- PARA PRODUCCION PRODUCTOS ----- /////
router.post(
    '/produccion-productos-terminados',
    verifyPermiso(['vPtsIngresos:listar']),
    controller.ingresarProduccionProductos,
)

/////--- PARA PRODUCCIÓN ----- /////
router.get('/produccion/:linea&:f1&:f2', controller.findReporteProduccion)

//--- Inventario hasta fecha ---///
router.get('/inventario', verifyPermiso(['vStock:listar']), controller.findInventario)

//--- PONER BIEN EL STOCK EN LOTES PADRE ---//
router.post('/recalcular-stock', controller.recalcularStock)

export default router
