import { Router } from "express"
import controller from "./cTransacciones.js"

const router = Router()

router.post('/', controller.create)
router.patch('/:id', controller.update)
router.get('/', controller.find)
router.get('/uno/:id', controller.findById)
router.delete('/:id', controller.delet)
router.patch('/anular/:id', controller.anular)

router.get('/lotes/:id', controller.findLotes)
router.post('/produccion-salida', controller.createProduccionSalida)
router.get('/items-produccion/:id', controller.findItemsProduccion)

router.post('/productos-terminados', controller.createProductosTerminados)
router.get('/productos-terminados', controller.findProductosTerminados)

router.get('/kardex/:id', controller.findKardex)

router.get('/items', controller.findItems)

router.post('/ajuste', controller.ajusteStock)

export default router