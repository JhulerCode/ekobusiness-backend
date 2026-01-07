const sistemaData = {
    empresa: {
        ruc: '20557053213',
        nombre: 'EKO BUSINESS S.A.C.',
        nombre_comercial: 'Sunka Herbal Tea',
        telefono: '(01) 432 865',
        correo: 'comercial@sunkatea.com',

        ecommerce_url: 'https://www.sunka.pe',
        facebook_url: 'https://www.facebook.com/SunkaTea',
        instagram_url: 'https://www.instagram.com/sunka.pe',
        whatsapp_ventas: '+51 999 888 777',
        whatsapp_ventas_url: 'https://wa.me/51999888777',

        email_ventas: 'comercial@sunkatea.com',
        email_soporte: 'soporte@sunkatea.com',
        yape_number: '913621456',

        igv_porcentaje: 18,
        direcciones: [
            {
                id: 1,
                nombre: 'PLANTA SANTA ANITA',
                direccion: 'Cal.7 Mza. D Lote. 10 Urb. Los Productores',
                ubigeo: 'Santa Anita - Lima - Lima',
                principal: true,
                datos_adicionales: {
                    referencia: 'Altura cuadra 4',
                }
            },
            { id: 2, nombre: 'OFICINA', direccion: 'Av. Mariscal La Mar 638', distrito: 'Miraflores - Lima - Lima', principal: false },
        ],
        bancos: [
            { id: 1, nombre: 'SCOTIABANK PERU S.A.A.', moneda: 'SOL', nc: '000-1927574', cci: '009-230-000001927574-42', principal: true },
            { id: 2, nombre: 'BANCO DE CRÉDITO DEL PERÚ - BCP', moneda: 'SOL', nc: '191-2611781-0-25', cci: '002-191002611781-025-54', principal: false },
        ]
    },
    documentos_identidad: [
        { id: 6, nombre: 'RUC' },
        { id: 1, nombre: 'DNI' },
        { id: 4, nombre: 'CARNET DE EXTRANJERÍA' },
        { id: 7, nombre: 'PASAPORTE' }
    ],
    unidades: [
        { id: 'NIU', nombre: 'Unidad', nombre_completo: 'Unidad (NIU)' },
        { id: 'KGM', nombre: 'Kilogramo', nombre_completo: 'Kilogramo (KGM)' },
    ],
    pedido_estados: [
        { id: '0', nombre: 'ANULADO' },
        { id: '1', nombre: 'ABIERTO' },
        { id: '2', nombre: 'CERRADO' }
    ],
    socio_pedidos_etapas: [
        { id: 1, nombre: "Pedido recibido", descripcion: 'Hemos recibido tu pedido correctamente y está siendo revisado por nuestro equipo.' },
        { id: 2, nombre: "Pago confirmado", descripcion: 'Tu pago ha sido validado. Ahora preparemos tu pedido lo antes posible.' },
        { id: 3, nombre: "Listo para entrega", descripcion: 'Tu pedido ya está preparado y listo para ser entregado o recogido.' },
        { id: 4, nombre: "Entregado", descripcion: 'La entrega se realizó con éxito.' },
    ],
    kardex_operaciones: [
        { id: '1', nombre: 'COMPRA', operacion: 1 },
        { id: '2', nombre: 'PRODUCCIÓN SALIDA', operacion: -1 },
        { id: '3', nombre: 'PRODUCCIÓN DEVOLUCIÓN', operacion: 1 },
        { id: '4', nombre: 'PRODUCCIÓN ENTRADA', operacion: 1 },
        { id: '5', nombre: 'VENTA', operacion: -1 },
        { id: '6', nombre: 'AJUSTE ENTRADA', operacion: 1 },
        { id: '7', nombre: 'AJUSTE SALIDA', operacion: -1 },
    ],
    transaccion_estados: [
        { id: '0', nombre: 'ANULADO' },
        { id: '1', nombre: 'ABIERTO' },
        { id: '2', nombre: 'CERRADO' }
    ],
    igv_afectaciones: [
        { id: '10', nombre: 'Gravado - Operación Onerosa' },
        { id: '20', nombre: 'Exonerado - Operación Onerosa' },
        { id: '30', nombre: 'Inafecto - Operación Onerosa' }
    ],

    produccion_orden_estados: [
        { id: '0', nombre: 'ANULADO' },
        { id: '1', nombre: 'ABIERTO' },
        { id: '2', nombre: 'CERRADO' }
    ],
    documentos_estados: [
        { id: '0', nombre: 'VENCIDO' },
        { id: '0.1', nombre: 'VENCE HOY' },
        { id: '1', nombre: 'POR VENCER' },
        { id: '2', nombre: 'VIGENTE' },
    ],
    estados: [
        { id: true, nombre: 'SI' },
        { id: false, nombre: 'NO' }
    ],
    generos: [
        { id: 'M', nombre: 'MASCULINO' },
        { id: 'F', nombre: 'FEMENINO' }
    ],
    caja_apertura_estados: [
        { id: '1', nombre: 'ABIERTO' },
        { id: '2', nombre: 'CERRADO' },
    ],
    cuarentena_productos_estados: [
        // { id: '0', nombre: 'ANULADO' },
        { id: '1', nombre: 'PENDIENTE' },
        { id: '2', nombre: 'ACEPTADO' }
    ],
    cumplidado_estados: [
        { id: 1, nombre: 'PENDIENTE' },
        { id: 2, nombre: 'COMPLETADO' },
    ],

    conformidad_estados: [
        { id: '1', nombre: 'CONFORME' },
        { id: '2', nombre: 'NO CONFORME' },
    ],
    cf_re_bpm_20_colores: [
        { id: '1', nombre: 'BLANCO' },
        { id: '2', nombre: 'AMARILLO' },
    ],
    cf_re_bpm_20_estados: [
        { id: '1', nombre: 'OPERATIVO' },
        { id: '2', nombre: 'INOPERATIVO' },
    ],
    cf_re_bpm_31_tipos: [
        { id: '1', nombre: 'EJERCICIO' },
        { id: '2', nombre: 'CASO REAL' },
    ],

    entrega_tipos: [
        { id: 'envio', nombre: 'ENVÍO', nombre_tienda: 'Envío a domicilio', },
        { id: 'retiro', nombre: 'RETIRO', nombre_tienda: 'Retira tu producto' },
    ],
    pago_condiciones: [
        { id: 1, nombre: 'CONTADO' },
        { id: 2, nombre: 'CRÉDITO 30 DÍAS' },
        { id: 3, nombre: 'CRÉDITO 60 DÍAS' }
    ],
    pago_metodos: [
        { id: 'tarjeta', nombre: 'Tarjeta de crédito o débito' },
        { id: 'yape', nombre: 'Yape' },
    ],
    comprobante_tipos: [
        { id: '03', nombre: 'BOLETA', codigo: 'BOLETA' },
        { id: '01', nombre: 'FACTURA', codigo: 'FACTURA' },
        { id: 'NV', nombre: 'NOTA DE VENTA', codigo: 'NOTA DE VENTA' },
    ],

    mp_tipos: [
        { id: 1, nombre: 'HIERBA BASE' },
        { id: 2, nombre: 'HIERBA COMPLEMENTO' },
        { id: 3, nombre: 'FRUTA' },
        { id: 4, nombre: 'ESPECIA' },
    ]
}

function arrayMap(array) {
    return sistemaData[array].reduce((obj, a) => (obj[a.id] = a, obj), {})
}

export {
    sistemaData,
    arrayMap,
}