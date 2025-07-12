import { Router } from "express"
import controller from "./cArticulos.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vArticulos',
        'vPrecioListaItems_crear',
        'vCompraPedidos_crear', 'vCompraPedidos_editar', 'vCompraPedidos_ingresarMercaderia',
        'vCompras_crear',
        'vProductosTerminados', 'vProductosTerminados_crearCombo',
        'vReceta_crear',
        'vVentaPedidos_crear', 'vVentaPedidos_editar', 'vVentaPedidos_entregarMercaderia',
        'vVentas_crear',
        'vProgramaFiltrantes_crear', 'vProgramaFiltrantes_editar', 'vProgramaFiltrantes_salidaInsumos',
        'vProgramaGranel_crear', 'vProgramaGranel_editar', 'vProgramaGranel_salidaInsumos',
        'vProgramaLuxury_crear', 'vProgramaLuxury_editar', 'vProgramaLuxury_salidaInsumos',
        'vProduccionHistorial_salidaInsumos',
        'vFormatosBpm:crear', 'vFormatosBpm:ver', 'vFormatosBpm:editar',
        'vFormatosPhs:crear', 'vFormatosPhs:ver', 'vFormatosPhs:editar',
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso([
        'vArticulos_crear', 'vArticulos_clonar',
        'vProductosTerminados_crear', 'vProductosTerminados_clonar', 'vProductosTerminados_crearCombo',
    ]),
    controller.create
)

router.patch(
    '/:id',
    verifyPermiso([
        'vArticulos_editar',
        'vProductosTerminados_editar',
    ]),
    controller.update
)

router.get(
    '/uno/:id',
    verifyPermiso([
        'vArticulos_editar', 'vArticulos_clonar',
        'vProductosTerminados_editar', 'vProductosTerminados_clonar',
    ]),
    controller.findById
)

router.delete(
    '/:id',
    verifyPermiso([
        'vArticulos_eliminar',
        'vProductosTerminados_eliminar',
    ]),
    controller.delet
)

router.post(
    '/bulk',
    verifyPermiso([
        'vArticulos_importar',
        'vProductosTerminados_importar',
    ]),
    controller.createBulk
)

router.patch(
    '/bulk/:id',
    verifyPermiso([
        'vArticulos_editarBulk',
        'vProductosTerminados_editarBulk'
    ]),
    controller.updateBulk
)

router.delete(
    '/bulk/:id',
    verifyPermiso([
        'vArticulos_eliminarBulk',
        'vProductosTerminados_eliminarBulk'
    ]),
    controller.deleteBulk
)

export default router