import { Router } from 'express'
import controller from './cProduccionOrdenes.js'
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vPrograma:listar',
        // 'vProgramaGranel:listar',
        // 'vProgramaLuxury:listar',
        'vProduccionHistorial:listar',
    ]),
    controller.find,
)

router.post(
    '/',
    verifyPermiso([
        'vPrograma:crear',
        // 'vProgramaGranel:crear',
        // 'vProgramaLuxury:crear'
    ]),
    controller.create,
)

router.get(
    '/uno/:id',
    verifyPermiso([
        'vPrograma:ver',
        'vPrograma:editar',
        'vPrograma:salidaInsumos',
        // 'vProgramaGranel:ver', 'vProgramaGranel:editar', 'vProgramaGranel:salidaInsumos',
        // 'vProgramaLuxury:ver', 'vProgramaLuxury:editar', 'vProgramaLuxury:salidaInsumos',
        'vProduccionHistorial:ver',
        'vProduccionHistorial:salidaInsumos',
    ]),
    controller.findById,
)

router.patch(
    '/:id',
    verifyPermiso([
        'vPrograma:editar',
        // 'vProgramaGranel:editar',
        // 'vProgramaLuxury:editar'
    ]),
    controller.update,
)

router.patch(
    '/terminar/:id',
    verifyPermiso([
        'vPrograma:terminar',
        // 'vProgramaGranel:terminar',
        // 'vProgramaLuxury:terminar'
    ]),
    controller.terminar,
)

router.patch(
    '/abrir/:id',
    verifyPermiso([
        'vPrograma:terminar',
        // 'vProgramaGranel:terminar',
        // 'vProgramaLuxury:terminar'
    ]),
    controller.abrir,
)

router.patch('/inicio/:id', controller.setInicio)

router.patch('/fin/:id', controller.setFin)

router.delete(
    '/:id',
    verifyPermiso([
        'vPrograma:eliminar',
        // 'vProgramaGranel:eliminar',
        // 'vProgramaLuxury:eliminar'
    ]),
    controller.delet,
)

router.get(
    '/trazabilidad/:id',
    verifyPermiso(['vProduccionHistorial:trazabilidad', 'vProductosCuarentena:trazabilidad']),
    controller.findTrazabilidad,
)

export default router
