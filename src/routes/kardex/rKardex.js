import { Router } from "express"
import controller from "./cKardex.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

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
        'vProduccionHistorial:productosTerminados',

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
        'vProduccionHistorial:productosTerminados',
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
    controller.updateProduccionProductos
)



///// ----- PARA PRODUCCIÓN ----- /////
router.get(
    '/produccion/:linea&:f1&:f2',
    controller.findReporteProduccion
)


//--- Inventario hasta fecha ---///
router.get(
    '/inventario',
    controller.findInventario
)

export default router