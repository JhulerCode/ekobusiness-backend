import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Moneda } from './Moneda.js'

export const PrecioLista = sequelize.define('precio_listas', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nombre: { type: DataTypes.STRING }, //required
    descripcion: { type: DataTypes.STRING },
    moneda: { type: DataTypes.STRING }, //required //linked
    activo: { type: DataTypes.BOOLEAN }, //required

    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING }
})

Moneda.hasMany(PrecioLista, { foreignKey: 'moneda', as: 'precio_listas', onDelete: 'RESTRICT' })
PrecioLista.belongsTo(Moneda, { foreignKey: 'moneda', as: 'moneda1' })