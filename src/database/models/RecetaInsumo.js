import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Articulo } from './Articulo.js'

export const RecetaInsumo = sequelize.define('receta_insumos', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    articulo_principal: { type: DataTypes.STRING }, //required //linked
    articulo: { type: DataTypes.STRING }, //required //linked
    cantidad: { type: DataTypes.DOUBLE }, //required
    orden: { type: DataTypes.INTEGER }, //required

    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },
})

Articulo.hasMany(RecetaInsumo, { foreignKey: 'articulo_principal', as: 'receta_insumos', onDelete: 'RESTRICT' })
RecetaInsumo.belongsTo(Articulo, { foreignKey: 'articulo_principal', as: 'articulo_principal1' })

Articulo.hasMany(RecetaInsumo, { foreignKey: 'articulo', as: 'articulos_principales', onDelete: 'RESTRICT' })
RecetaInsumo.belongsTo(Articulo, { foreignKey: 'articulo', as: 'articulo1' })