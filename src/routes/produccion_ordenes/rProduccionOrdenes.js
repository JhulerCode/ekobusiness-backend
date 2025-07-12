import { Router } from "express"
import controller from "./cProduccionOrdenes.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vProgramaFiltrantes',
        'vProgramaGranel',
        'vProgramaLuxury',
        'vProduccionHistorial',
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso([
        'vProgramaFiltrantes_crear',
        'vProgramaGranel_crear',
        'vProgramaLuxury_crear'
    ]),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso([
        'vProgramaFiltrantes_ver', 'vProgramaFiltrantes_editar', 'vProgramaFiltrantes_salidaInsumos',
        'vProgramaGranel_ver', 'vProgramaGranel_editar', 'vProgramaGranel_salidaInsumos',
        'vProgramaLuxury_ver', 'vProgramaLuxury_editar', 'vProgramaLuxury_salidaInsumos',
        'vProduccionHistorial_ver', 'vProduccionHistorial_salidaInsumos',
    ]),
    controller.findById
)

router.patch(
    '/:id',
    verifyPermiso([
        'vProgramaFiltrantes_editar',
        'vProgramaGranel_editar',
        'vProgramaLuxury_editar'
    ]),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso([
        'vProgramaFiltrantes_eliminar',
        'vProgramaGranel_eliminar',
        'vProgramaLuxury_eliminar'
    ]),
    controller.delet
)

export default router