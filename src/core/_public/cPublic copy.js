import { buscarEmpresaPorSubdominio, guardarEmpresa } from '#store/empresas.js'
import { Repository } from '#db/Repository.js'
import dayjs from '#shared/dayjs.js'

const getInfoEmpresa = async (req, res) => {
    try {
        const subdominio = req.headers['x-empresa']
        let empresa = await buscarEmpresaPorSubdominio(subdominio)

        if (!empresa) {
            const EmpresaRepository = new Repository('Empresa')
            const qry = {
                fltr: {
                    subdominio: { op: 'Igual', val: subdominio },
                },
                cols: { exclude: [] },
            }
            const empresas = await EmpresaRepository.find(qry, true)

            if (empresas.length > 0) {
                empresa = empresas[0]

                // --- OBTENER SUSCRIPCIONES --- //
                if (empresa.subdominio !== 'admin') {
                    const SuscripcionRepository = new Repository('Suscripcion')
                    const qrySub = {
                        fltr: {
                            empresa: { op: 'Es', val: empresa.id },
                            fecha_vencimiento: {
                                op: 'Es igual o posterior a',
                                val: dayjs().format('YYYY-MM-DD'),
                            },
                        },
                        cols: ['fecha_vencimiento', 'limite_usuarios'],
                        sort: [['fecha_vencimiento', 'DESC']],
                    }

                    const suscripciones = await SuscripcionRepository.find(qrySub)
                    if (suscripciones.length === 0) {
                        return res.json({
                            code: 1,
                            msg: 'La empresa no cuenta con una suscripción activa',
                        })
                    }

                    empresa.suscripciones = suscripciones.map((s) => ({
                        fecha_vencimiento: s.fecha_vencimiento,
                        limite_usuarios: s.limite_usuarios || 0,
                    }))
                }

                await guardarEmpresa(empresa.id, empresa)
            }
        }

        if (!empresa) {
            return res.status(404).json({ code: 404, msg: 'Empresa no encontrada' })
        }

        return res.json({
            code: 0,
            data: {
                razon_social: empresa.razon_social,
                nombre_comercial: empresa.nombre_comercial,
                logo: empresa.logo,
            },
        })
    } catch (error) {
        return res
            .status(500)
            .json({ code: -1, msg: 'Error al consultar empresa', error: error.message })
    }
}

export default {
    getInfoEmpresa,
}
