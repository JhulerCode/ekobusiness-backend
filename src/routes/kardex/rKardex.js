import { Router } from "express"
import controller from "./cKardex.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso(),
    controller.find
)

router.patch(
    '/:id',
    verifyPermiso(),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso(),
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


///// ----- PARA PRODUCCION INSUMOS ----- /////
router.post(
    '/produccion-insumos',
    verifyPermiso([
        'vProgramaFiltrantes:salidaInsumos',
        'vProgramaGranel:salidaInsumos',
        'vProgramaLuxury:salidaInsumos',
        'vProduccionHistorial:salidaInsumos',
    ]),
    controller.createProduccionInsumo
)


///// ----- PARA PRODUCCION PRODUCTOS ----- /////
router.post(
    '/produccion-productos',
    verifyPermiso([
        'vProgramaFiltrantes:productosTerminados',
        'vProgramaGranel:productosTerminados',
        'vProgramaLuxury:productosTerminados',
        'vProduccionHistorial:productosTerminados',
    ]),
    controller.createProduccionProductos
)

router.post(
    '/produccion-productos-terminados',
    verifyPermiso([
        'vPtsIngresos:listar'
    ]),
    controller.updateProduccionProductos
)



router.get(
    '/items',
    verifyPermiso([
        'vProduccionHistorial:productosTerminados',
    ]),
    controller.findItems
)

router.post(
    '/ajuste',
    verifyPermiso([
        'vArticulos:ajusteStock',
        'vProductosTerminados:ajusteStock',
    ]),
    controller.ajusteStock
)

export default router