async function addEmpresaId(req, res, next) {
    const empresa = req.headers["x-empresa"]

    req.user = {
        id: '94021976-dd1f-4331-9480-e2bead814a48',
        empresa,
    }

    next()
}

export default addEmpresaId