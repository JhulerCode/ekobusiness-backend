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

        'vProgramaFiltrantes:salidaInsumos',
        'vProgramaGranel:salidaInsumos',
        'vProgramaLuxury:salidaInsumos',
        'vProduccionHistorial:salidaInsumos',

        'vProgramaFiltrantes:productosTerminados',
        'vProgramaGranel:productosTerminados',
        'vProgramaLuxury:productosTerminados',
        'vProduccionHistorial:productosTerminados',

        'vProgramaFiltrantes:salidaInsumosCompartidos',
    ]),
    controller.create
)

router.patch(
    '/:id',
    verifyPermiso([
        'vProgramaFiltrantes:productosTerminados',
        'vProgramaGranel:productosTerminados',
        'vProgramaLuxury:productosTerminados',
        'vProduccionHistorial:productosTerminados',
    ]),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso([
        'vProgramaFiltrantes:salidaInsumos',
        'vProgramaGranel:salidaInsumos',
        'vProgramaLuxury:salidaInsumos',
        'vProduccionHistorial:salidaInsumos',

        'vProgramaFiltrantes:productosTerminados',
        'vProgramaGranel:productosTerminados',
        'vProgramaLuxury:productosTerminados',
        'vProduccionHistorial:productosTerminados',

        'vProgramaFiltrantes:salidaInsumosCompartidos',
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

        'vProgramaFiltrantes:salidaInsumos',
        'vProgramaGranel:salidaInsumos',
        'vProgramaLuxury:salidaInsumos',
        'vProduccionHistorial:salidaInsumos',

        'vProgramaFiltrantes:salidaInsumosCompartidos',
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

export default router