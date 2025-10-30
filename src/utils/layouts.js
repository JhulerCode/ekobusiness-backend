// import dayjs from 'dayjs'
// import utc from 'dayjs/plugin/utc.js'
// import timezone from 'dayjs/plugin/timezone.js'

// dayjs.extend(utc)
// dayjs.extend(timezone)
// dayjs.tz.setDefault('America/Lima')

import dayjs from '../utils/dayjs.js'

const primary_color = '#2492c2'
const companyName = 'Sunka Herbal Tea'
const companyWeb = 'sunka.pe'
const contactEmail = 'comercial@sunkatea.com';
const whatsappNumber = '+51 999 888 777'
const atentamente = 'Sunka Herbal Tea'
const derechos = `© ${dayjs().format('YYYY')} ${companyName}, todos los derechos reservados.`
const pedidosLink = 'https://ekobusiness-ecommerce.vercel.app/account'

function htmlArco(nombres, apellidos, codigo, fecha_recepcion, tipo, email) {
    return `
<html>
    <head>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Google Sans', Roboto, RobotoDraft, Helvetica,
                    Arial, sans-serif;
                border: none;
                outline: none;
                color: #3c3c3b;
                font-size: 15px;
            }

            section {
                width: 100%;
                background-color: whitesmoke;
                padding: 1rem;
            }

            article {
                background-color: white;
                padding: 1rem;
                border-radius: 0.5rem;
                margin: 0 auto;
                width: 35rem;
            }

            h1 {
                text-align: center;
                font-size: 2rem;
            }

            footer {
                text-align: center;
                margin: 0 auto;
                margin-top: 2rem;
                width: 35rem;
            }

            footer p {
                margin-top: 0.5rem;
                font-size: 0.8rem;
            }

            .container-mensaje {
                margin: 2rem 2rem 0 2rem;
            }

            .container-mensaje strong,
            .container-mensaje p {
                font-size: 1rem;
                word-spacing: 3px;
                line-height: 1.4;
            }

            .resaltado {
                color: ${primary_color};
            }

            .container-codigo {
                padding: 1.5rem 1rem;
                border-radius: 1rem 0 1rem 0;
                border: solid 0.06rem whitesmoke;
                margin: 2rem 2rem;
            }

            .container-codigo p {
                color: #b6b6b6;
            }
        </style>
    </head>

    <body>
        <section>
            <article>
                <h1>${companyName}</h1>

                <div class="container-mensaje">
                    <p>Estimado/a ${nombres} ${apellidos},</p>
                    
                    <p>
                        Hemos recibido correctamente su solicitud de ejercicio de
                        <strong class="resaltado">Derechos ARCO</strong> (Acceso, Rectificación,
                        Cancelación u Oposición).
                    </p>

                    <div class="container-codigo">
                        <strong>Código de solicitud:</strong> ${codigo}<br />
                        <strong>Fecha de recepción:</strong> ${dayjs(fecha_recepcion).format('DD/MM/YYYY')}<br />
                        <strong>Tipo de solicitud:</strong> ${tipo}<br />
                        <strong>Correo registrado:</strong> ${email}<br />
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
                </div>
            </article>

            <footer>
                <p>Atentamente <br />${atentamente}</p>

                <p>
                    Comunicate con nosotros por los siguientes medios:
                    <br />Correo: ${contactEmail} <br />WhatsApp:
                    ${whatsappNumber}
                </p>

                <p>${derechos}</p>
            </footer>
        </section>
    </body>
</html>
    `
}

function htmlLibroReclamos(nombres, apellidos, codigo, fecha_recepcion, tipo, resumen, detalle) {
    return `
<html>
    <head>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Google Sans', Roboto, RobotoDraft, Helvetica,
                    Arial, sans-serif;
                border: none;
                outline: none;
                color: #3c3c3b;
                font-size: 15px;
            }

            section {
                width: 100%;
                background-color: whitesmoke;
                padding: 1rem;
            }

            article {
                background-color: white;
                padding: 1rem;
                border-radius: 0.5rem;
                margin: 0 auto;
                width: 35rem;
            }

            h1 {
                text-align: center;
                font-size: 2rem;
            }

            footer {
                text-align: center;
                margin: 0 auto;
                margin-top: 2rem;
                width: 35rem;
            }

            footer p {
                margin-top: 0.5rem;
                font-size: 0.8rem;
            }

            .container-mensaje {
                margin: 2rem 2rem 0 2rem;
            }

            .container-mensaje strong,
            .container-mensaje p {
                font-size: 1rem;
                word-spacing: 3px;
                line-height: 1.4;
            }

            .resaltado {
                color: ${primary_color};
            }

            .container-codigo {
                padding: 1.5rem 1rem;
                border-radius: 1rem 0 1rem 0;
                border: solid 0.06rem whitesmoke;
                margin: 2rem 2rem;
            }

            .container-codigo p {
                color: #b6b6b6;
            }
        </style>
    </head>

    <body>
        <section>
            <article>
                <h1>${companyName}</h1>

                <div class="container-mensaje">
                    <p>Estimado/a ${nombres} ${apellidos},</p>
                    
                    <p>
                        Hemos recibido correctamente su registro en nuestro <strong class="resaltado">Libro de Reclamaciones</strong>.
                    </p>

                    <div class="container-codigo">
                        <strong>Código de solicitud:</strong> ${codigo}<br />
                        <strong>Fecha de recepción:</strong> ${dayjs(fecha_recepcion).format('DD/MM/YYYY')}<br />
                        <strong>Tipo de solicitud:</strong> ${tipo}<br />
                        <strong>Resumen:</strong> ${resumen}<br />
                        <strong>Detalle:</strong> ${detalle}<br />
                    </div>

                    <p>
                        Nuestro equipo revisará su caso y le brindará una respuesta dentro del plazo máximo establecido por <strong>INDECOPI</strong>.
                    </p>
                    <br>
                    <p>Agradecemos su tiempo y la confianza en nosotros para mejorar continuamente nuestro servicio. </p>
                </div>
            </article>

            <footer>
                <p>Atentamente <br />${atentamente}</p>

                <p>
                    Comunicate con nosotros por los siguientes medios:
                    <br />Correo: ${contactEmail} <br />WhatsApp:
                    ${whatsappNumber}
                </p>
                <br>
                <p>${derechos}</p>
            </footer>
        </section>
    </body>
</html>
    `
}

function htmlCodigoVerificacion(codigo) {
    return `
<html>
    <head>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Google Sans', Roboto, RobotoDraft, Helvetica,
                    Arial, sans-serif;
                border: none;
                outline: none;
                color: #3c3c3b;
                font-size: 15px;
            }

            section {
                width: 100%;
                background-color: whitesmoke;
                padding: 1rem;
            }

            article {
                background-color: white;
                padding: 1rem;
                border-radius: 0.5rem;
                margin: 0 auto;
                width: 35rem;
            }

            h1 {
                text-align: center;
                font-size: 2rem;
            }

            footer {
                text-align: center;
                margin: 0 auto;
                margin-top: 2rem;
                width: 35rem;
            }

            footer p {
                margin-top: 0.5rem;
                font-size: 0.8rem;
            }

            .container-mensaje {
                margin: 2rem 2rem 0 2rem;
            }

            .container-mensaje strong,
            .container-mensaje p {
                font-size: 1rem;
                word-spacing: 3px;
                line-height: 1.4;
            }

            .resaltado {
                color: ${primary_color};
            }

            .container-codigo {
                padding: 1.5rem 1rem;
                border-radius: 1rem 0 1rem 0;
                border: solid 0.06rem whitesmoke;
                margin: 2rem 2rem;
                text-align: center;
            }

            .container-codigo p {
                color: #b6b6b6;
            }

            .codigo {
                font-size: 3rem;
            }
        </style>
    </head>

    <body>
        <section>
            <article>
                <h1>${companyName}</h1>

                <div class="container-mensaje">
                    <p>Estimado usuario:</p>
                    <p>
                        Para seguir con tu solicitud, ingresa este
                        <strong class="resaltado">código de verificación</strong> en
                        la web.
                    </p>
                </div>

                <div class="container-codigo">
                    <p>Tu código de verificación es</p>
                    <strong class="resaltado codigo">${codigo}</strong>
                </div>
            </article>

            <footer>
                <p>Atentamente <br />${atentamente}</p>

                <p>
                    Comunicate con nosotros por los siguientes medios:
                    <br />Correo: ${contactEmail} <br />WhatsApp:
                    ${whatsappNumber}
                </p>

                <p>${derechos}</p>
            </footer>
        </section>
    </body>
</html>
    `
}

function htmlConfirmacionCompra(nombres, apellidos, codigo, entrega_tipo, monto, socio_pedido_items) {
    return `
<html>
    <head>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Google Sans', Roboto, RobotoDraft, Helvetica,
                    Arial, sans-serif;
                border: none;
                outline: none;
                color: #3c3c3b;
                font-size: 15px;
            }

            section {
                width: 100%;
                background-color: whitesmoke;
                padding: 1rem;
            }

            article {
                background-color: white;
                padding: 1rem;
                border-radius: 0.5rem;
                margin: 0 auto;
                width: 35rem;
            }

            h1 {
                text-align: center;
                font-size: 2rem;
            }

            footer {
                text-align: center;
                margin: 0 auto;
                margin-top: 2rem;
                width: 35rem;
            }

            footer p {
                margin-top: 0.5rem;
                font-size: 0.8rem;
            }

            .container-mensaje {
                margin: 2rem 2rem 0 2rem;
            }

            .container-mensaje strong,
            .container-mensaje p {
                font-size: 1rem;
                line-height: 1.4;
            }

            .resaltado {
                color: ${primary_color};
            }

            .container-codigo {
                padding: 1.5rem 1rem;
                border-radius: 1rem 0 1rem 0;
                border: solid 0.06rem whitesmoke;
                margin: 2rem 2rem;
            }

            .container-codigo p {
                color: #b6b6b6;
            }

            .container-productos {
                margin-bottom: 3rem;
            }

            .container-productos h2 {
                font-weight: bold;
                margin-bottom: 1rem;
            }

            .container-productos li {
                display: flex;
                margin: 0 0 1rem 0;
            }

            .container-productos li .container-producto-foto{
                width: 4rem;
                max-height: 4rem;
                flex-shrink: 0;
            }

            .container-productos li .container-producto-foto img{
                max-width: 100%;
                max-height: 100%;
                object-fit: cover;
            }

            .container-productos li .container-producto-nombre{
                flex: 1;
                margin: 0 1rem;
            }

            .container-productos li .container-producto-cantidad{
                width: 3rem;
                flex-shrink: 0;
                font-size: 1.2rem;
            }

            .container-calltoaction {
                padding: 1rem;
                background-color: whitesmoke;
                border-radius: 1rem;
                text-align: center;
            }

            .container-calltoaction a:hover {
                font-weight: bold;
            }
        </style>
    </head>

    <body>
        <section>
            <article>
                <h1>${companyName}</h1>

                <div class="container-mensaje">
                    <p>Estimado/a ${nombres} ${apellidos},</p>

                    <p>
                        Hemos recibido correctamente su registro de compra en
                        nuestra
                        <strong class="resaltado">tienda online</strong>.
                    </p>

                    <div class="container-codigo">
                        <strong>Código de compra:</strong> ${codigo}<br />
                        <strong>Tipo de entrega:</strong> ${entrega_tipo}<br />
                        <strong>Importe:</strong> ${monto}<br />
                    </div>

                    <div class="container-productos">
                        <h2>Detalle de productos:</h2>
                        <ul>
                            <!-- ${socio_pedido_items.map(a => ` -->
                                <li>
                                    <div class="container-producto-foto">
                                        <img
                                            src="${a.foto}"
                                        />
                                    </div>
                                    <div class="container-producto-nombre">
                                        ${a.nombre}
                                    </div>
                                    <div class="container-producto-cantidad">
                                        x${a.cantidad}
                                    </div>
                                </li>
                            <!-- `)} -->
                        </ul>
                    </div>

                    <div class="container-calltoaction">
                        <p>
                            Comenzaremos a preparar tu pedido y te mantendremos
                            al tanto de cualquier novedad.
                        </p>
                        <br>
                        <a href="${pedidosLink}" target="_blank">Ir a mis compras</a>
                    </div>
                </div>
            </article>

            <footer>
                <p>Atentamente <br />${atentamente}</p>

                <p>
                    Comunicate con nosotros por los siguientes medios:<br />
                    Correo: ${contactEmail} <br />
                    WhatsApp: ${whatsappNumber}
                </p>
                <br />
                <p>${derechos}</p>
            </footer>
        </section>
    </body>
</html>
    `
}

export {
    companyName,
    htmlArco,
    htmlLibroReclamos,
    htmlCodigoVerificacion,
    htmlConfirmacionCompra,
}