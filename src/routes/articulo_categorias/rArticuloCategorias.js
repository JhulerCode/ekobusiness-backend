import { Router } from "express"
import controller from "./cArticuloCategorias.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vArticuloCategorias',
        'vArticulos', 'vArticulos_crear', 'vArticulos_editar', 'vArticulos_clonar', 'vArticulos_importar', 'vArticulos_editarBulk',
        'vProductoCategorias',
        'vProductosTerminados', 'vProductosTerminados_crear', 'vProductosTerminados_editar', 'vProductosTerminados_clonar', 'vProductosTerminados_crearCombo', 'vProductosTerminados_importar', 'vProductosTerminados_editarBulk',
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso([
        'vArticuloCategorias_crear',
        'vProductoCategorias_crear'
    ]),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso([
        'vArticuloCategorias_ver', 'vArticuloCategorias_editar',
        'vProductoCategorias_ver', 'vProductoCategorias_editar',
    ]),
    controller.findById
)

router.patch(
    '/:id',
    verifyPermiso([
        'vArticuloCategorias_editar',
        'vProductoCategorias_editar'
    ]),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso([
        'vArticuloCategorias_eliminar',
        'vProductoCategorias_eliminar'
    ]),
    controller.delet
)

export default router