import { Router } from "express"
import controller from "./cCuarentenaProductos.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vProductosCuarentena:listar',
        'vPtsIngresos:verCuarentena',
        'vProgramaFiltrantes:productosCuarentena',
        'vProgramaGranel:productosCuarentena',
        'vProgramaLuxury:productosCuarentena',
        'vProduccionHistorial:productosCuarentena',
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso(['vProductosCuarentena:crear']),
    controller.create
)

// router.get(
//     '/uno/:id',
//     verifyPermiso(['vProductosCuarentena:ver']),
//     controller.findById
// )

router.patch(
    '/:id',
    verifyPermiso(['vProductosCuarentena:editar']),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso(['vProductosCuarentena:eliminar']),
    controller.delet
)

export default router