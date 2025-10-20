import { Router } from "express"
import controller from "../socios/cSocios.js"

const router = Router()

router.post('/', controller.createToNewsletter)

export default router