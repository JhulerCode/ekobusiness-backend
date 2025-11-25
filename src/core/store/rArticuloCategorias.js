import { Router } from "express"
import controller from "./../articulo_categorias/cArticuloCategorias.js"

const router = Router()

router.get('/', controller.find)

export default router