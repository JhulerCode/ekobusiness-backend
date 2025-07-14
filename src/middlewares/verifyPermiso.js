function verifyPermiso(requiredPermissions = []) {
    return (req, res, next) => {
        console.log(req.method, req.originalUrl)

        const userPermissions = req.user?.permisos || []

        const hasPermission = requiredPermissions.some(perm =>
            userPermissions.includes(perm)
        )

        if (!hasPermission) {
            return res.status(403).json({ msg: 'Acceso denegado: permisos insuficientes' })
        }

        next()
    }
}

export default verifyPermiso