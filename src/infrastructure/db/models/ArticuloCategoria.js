import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Colaborador } from './Colaborador.js'
import { arrayMap } from '#store/system.js'

const systemMaps = {
    estados: arrayMap('estados'),
}

export const ArticuloCategoria = sequelize.define('articulo_categorias', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tipo: { type: DataTypes.STRING },
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
    is_destacado: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_destacado1: {
        type: DataTypes.VIRTUAL,
        get() {
            return systemMaps.estados[this.getDataValue('is_destacado')]
        },
    },
    fotos: { type: DataTypes.JSON, defaultValue: [] },

    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING }
})

Colaborador.hasMany(ArticuloCategoria, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
ArticuloCategoria.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(ArticuloCategoria, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
ArticuloCategoria.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })