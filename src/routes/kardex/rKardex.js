import { Router } from "express"
import controller from "./cKardex.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    controller.find
)

router.patch(
    '/:id',
    controller.update
)

router.delete(
    '/:id',
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

router.get(
    '/produccion-insumos/:id',
    verifyPermiso([
        'vProgramaFiltrantes:salidaInsumos',
        'vProgramaGranel:salidaInsumos',
        'vProgramaLuxury:salidaInsumos',
        'vProduccionHistorial:salidaInsumos',
    ]),
    controller.findProduccionProductos
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

router.get(
    '/produccion-productos',
    verifyPermiso([
        'vProgramaFiltrantes:productosTerminados',
        'vProgramaGranel:productosTerminados',
        'vProgramaLuxury:productosTerminados',
        'vProduccionHistorial:productosTerminados',
        'vProductosCuarentena:listar',
        'vPtsIngresos:listar'
    ]),
    controller.findProductosTerminados
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