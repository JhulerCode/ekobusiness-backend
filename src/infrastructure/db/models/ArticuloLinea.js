import sequelize from '../sequelize.js'
import { DataTypes } from 'sequelize'
import { Colaborador } from './Colaborador.js'
import { Empresa } from './Empresa.js'
import { arrayMap } from '#store/system.js'

const systemMaps = {
    estados: arrayMap('estados'),
}

export const ArticuloLinea = sequelize.define('articulo_lineas', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nombre: { type: DataTypes.STRING }, //required
    activo: { type: DataTypes.BOOLEAN }, //required
    activo1: {
        type: DataTypes.VIRTUAL,
        get() {
            return systemMaps.estados[this.getDataValue('activo')]
        },
    },

    is_ecommerce: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_ecommerce1: {
        type: DataTypes.VIRTUAL,
        get() {
            return systemMaps.estados[this.getDataValue('is_ecommerce')]
        },
    },
    descripcion: { type: DataTypes.TEXT },
    fotos: { type: DataTypes.JSON, defaultValue: [] },

    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING }
})

Empresa.hasMany(ArticuloLinea, { foreignKey: 'empresa', as: 'articulo_lineas', onDelete: 'RESTRICT' })
ArticuloLinea.belongsTo(Empresa, { foreignKey: 'empresa', as: 'empresa1' })

Colaborador.hasMany(ArticuloLinea, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
ArticuloLinea.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(ArticuloLinea, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
ArticuloLinea.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })