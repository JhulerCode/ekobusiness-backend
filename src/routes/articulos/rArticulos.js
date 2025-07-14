import { Router } from "express"
import controller from "./cArticulos.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vArticulos:listar',
        'vPrecioListaItems:crear',
        'vCompraPedidos:crear', 'vCompraPedidos:editar', 'vCompraPedidos:ingresarMercaderia',
        'vCompras:crear',
        'vProductosTerminados:listar', 'vProductosTerminados:crearCombo',
        'vReceta:crear',
        'vVentaPedidos:crear', 'vVentaPedidos:editar', 'vVentaPedidos:entregarMercaderia',
        'vVentas:crear',
        'vProgramaFiltrantes:crear', 'vProgramaFiltrantes:editar', 'vProgramaFiltrantes:salidaInsumos',
        'vProgramaGranel:crear', 'vProgramaGranel:editar', 'vProgramaGranel:salidaInsumos',
        'vProgramaLuxury:crear', 'vProgramaLuxury:editar', 'vProgramaLuxury:salidaInsumos',
        'vProduccionHistorial:salidaInsumos',
        'vFormatosBpm:crear', 'vFormatosBpm:ver', 'vFormatosBpm:editar',
        'vFormatosPhs:crear', 'vFormatosPhs:ver', 'vFormatosPhs:editar',
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso([
        'vArticulos:crear', 'vArticulos:clonar',
        'vProductosTerminados:crear', 'vProductosTerminados:clonar', 'vProductosTerminados:crearCombo',
    ]),
    controller.create
)

router.patch(
    '/:id',
    verifyPermiso([
        'vArticulos:editar',
        'vProductosTerminados:editar',
    ]),
    controller.update
)

router.get(
    '/uno/:id',
    verifyPermiso([
        'vArticulos:editar', 'vArticulos:clonar',
        'vProductosTerminados:editar', 'vProductosTerminados:clonar',
    ]),
    controller.findById
)

router.delete(
    '/:id',
    verifyPermiso([
        'vArticulos:eliminar',
        'vProductosTerminados:eliminar',
    ]),
    controller.delet
)

router.post(
    '/bulk',
    verifyPermiso([
        'vArticulos:importar',
        'vProductosTerminados:importar',
    ]),
    controller.createBulk
)

router.patch(
    '/bulk/:id',
    verifyPermiso([
        'vArticulos:editarBulk',
        'vProductosTerminados:editarBulk'
    ]),
    controller.updateBulk
)

router.delete(
    '/bulk/:id',
    verifyPermiso([
        'vArticulos:eliminarBulk',
        'vProductosTerminados:eliminarBulk'
    ]),
    controller.deleteBulk
)

export default router