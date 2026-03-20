import { buscarEmpresaPorSubdominio, guardarEmpresa } from '#store/empresas.js'
import { Repository } from '#db/Repository.js'

const getInfoEmpresa = async (req, res) => {
    try {
        const subdominio = req.headers['x-empresa']
        let empresa = buscarEmpresaPorSubdominio(subdominio)

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
                guardarEmpresa(empresa.id, empresa)
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
