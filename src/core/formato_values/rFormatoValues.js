import { Router } from "express"
import controller from "./cFormatoValues.js"
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vFormatosBpm:listar',
        'vFormatosPhs:listar',
        'vFormatosHaccp:listar'
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso([
        'vCompraItems:inspeccion',
        'vVentas:controlDespacho',
        'vProduccionHistorial:controlPesos',
        'vProduccionHistorial:controlPpc',
        'vProductosCuarentena:liberar_lote',
        'vFormatosBpm:crear',
        'vFormatosPhs:crear',
        'vFormatosHaccp:crear'
    ]),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso([
        'vCompraItems:inspeccion',
        'vVentas:controlDespacho',
        'vProduccionHistorial:controlPesos',
        'vProduccionHistorial:controlPpc',
        'vProductosCuarentena:liberar_lote',
        'vFormatosBpm:ver', 'vFormatosBpm:editar',
        'vFormatosPhs:ver', 'vFormatosPhs:editar',
        'vFormatosHaccp:ver', 'vFormatosHaccp:editar',
    ]),
    controller.findById
)

router.patch(
    '/:id',
    verifyPermiso([
        'vCompraItems:inspeccion',
        'vVentas:controlDespacho',
        'vProduccionHistorial:controlPesos',
        'vProduccionHistorial:controlPpc',
        'vProductosCuarentena:liberar_lote',
        'vFormatosBpm:editar',
        'vFormatosPhs:editar',
        'vFormatosHaccp:editar'
    ]),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso([
        'vFormatosBpm:eliminar',
        'vFormatosPhs:eliminar',
        'vFormatosHaccp:eliminar'
    ]),
    controller.delet
)


export default router