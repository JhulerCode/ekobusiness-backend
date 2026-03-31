import { obtenerEmpresaConSuscripciones } from '#store/empresas.js'

const getInfoEmpresa = async (req, res) => {
    try {
        const subdominio = req.headers['x-empresa']
        const { empresa, error } = await obtenerEmpresaConSuscripciones(subdominio)

        if (error || !empresa) {
            const code = error === 'Empresa no encontrada' ? 404 : 1
            return res.status(code === 404 ? 404 : 200).json({ code, msg: error })
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
