import nodemailer from 'nodemailer'
import config from '../../config.js'

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: config.SOPORTE_EMAIL,
        pass: config.SOPORTE_EMAIL_PASS,
    },
})

// transporter.verify().then(() => {
//     console.log('Listo para enviar correos')
// })

const nodeMailer = () => {
    // console.log(config.email,config.emailpass)
    return transporter
}

export { nodeMailer }
