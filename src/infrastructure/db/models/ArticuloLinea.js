import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Colaborador } from './Colaborador.js'

export const ArticuloLinea = sequelize.define('articulo_lineas', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nombre: { type: DataTypes.STRING }, //required
    activo: { type: DataTypes.BOOLEAN }, //required

    descripcion: { type: DataTypes.TEXT },
    fotos: { type: DataTypes.JSON, defaultValue: [] },
    videos: { type: DataTypes.JSON, defaultValue: [] },

    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING }
})

Colaborador.hasMany(ArticuloLinea, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
ArticuloLinea.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(ArticuloLinea, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
ArticuloLinea.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })