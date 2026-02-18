import { Router } from 'express'
import controller from './cComboComponentes.js'

const router = Router()

router.get('/', controller.find)

router.post('/bulk', controller.createBulk)

export default router
