import { Router } from 'express'
import ctrl from './cPublic.js'

const router = Router()

router.get('/info-empresa', ctrl.getInfoEmpresa)

export default router
