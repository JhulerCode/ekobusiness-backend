import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('America/Lima')

const companyName = 'EKO BUSINESS S.A.C.'
const companyWeb = 'sunka.pe'
const derechos = `© ${dayjs().format('YYYY')} ${companyName}, todos los derechos reservados.`

function arcoHtml(nombres, apellidos, codigo, fecha_recepcion, tipo, email) {
    return `
    <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <title>Confirmación de Solicitud ARCO</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    background-color: #f9fafb;
                    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    color: #333333;
                }
                .container {
                    max-width: 600px;
                    margin: 40px auto;
                    background: #ffffff;
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                }
                .header {
                    background-color: black;
                    color: #ffffff;
                    text-align: center;
                    padding: 24px 20px;
                }
                .header h1 {
                    margin: 0;
                    font-size: 22px;
                    letter-spacing: 0.5px;
                }
                .content {
                    padding: 32px 28px;
                    line-height: 1.6;
                }
                .content h2 {
                    font-size: 18px;
                    margin-top: 0;
                    color: black;
                }
                .highlight {
                    background: #f9fafb;
                    border-left: 4px solid black;
                    padding: 12px 16px;
                    margin: 20px 0;
                    border-radius: 8px;
                    font-size: 15px;
                }
                .details {
                    margin-top: 24px;
                    border-collapse: collapse;
                    width: 100%;
                }
                .details td {
                    padding: 8px 0;
                    border-bottom: 1px solid #eee;
                    font-size: 14px;
                }
                .details td:first-child {
                    font-weight: 600;
                    width: 160px;
                }
                .footer {
                    background: #f9fafb;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #666666;
                }
                .footer a {
                    color: black;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Solicitud ARCO recibida</h1>
                </div>
                <div class="content">
                    <h2>Estimado/a ${nombres} ${apellidos},</h2>
                    <p>
                        Hemos recibido correctamente su solicitud de ejercicio de
                        <strong>Derechos ARCO</strong> (Acceso, Rectificación,
                        Cancelación u Oposición).
                    </p>
                    <div class="highlight">
                        <strong>Código de solicitud:</strong> ${codigo}<br />
                        <strong>Fecha de recepción:</strong> ${dayjs(fecha_recepcion).format('DD/MM/YYYY')}
                    </div>
                    <p>
                        Nuestro equipo de Protección de Datos revisará su solicitud
                        y le brindará una respuesta dentro del plazo máximo
                        establecido por la
                        <strong
                            >Ley N° 29733 – Ley de Protección de Datos
                            Personales</strong
                        >.
                    </p>
                    <table class="details">
                        <tr>
                            <td>Tipo de solicitud:</td>
                            <td>${tipo}</td>
                        </tr>
                        <tr>
                            <td>Correo registrado:</td>
                            <td>${email}</td>
                        </tr>
                    </table>
                    <p style="margin-top: 28px">
                        Si necesita contactarse con nosotros o presentar
                        documentación adicional, puede hacerlo respondiendo a este
                        correo o a través de nuestros canales oficiales.
                    </p>
                    <p style="margin-top: 20px">
                        Gracias por confiar en <strong>${companyName}</strong>.
                    </p>
                </div>
                <div class="footer">
                    ${derechos}<br />
                    <a href="${companyWeb}">${companyWeb}</a>
                </div>
            </div>
        </body>
    </html>
    `
}

export {
    companyName,
    arcoHtml
}