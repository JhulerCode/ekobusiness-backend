import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Articulo } from './Articulo.js'
import { Empresa } from './Empresa.js'
import { Colaborador } from './Colaborador.js'

export const ComboComponente = sequelize.define('combo_componentes', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    articulo_principal: { type: DataTypes.STRING },
    articulo: { type: DataTypes.STRING },
    cantidad: { type: DataTypes.DOUBLE },
    orden: { type: DataTypes.INTEGER },

    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },
})

Articulo.hasMany(ComboComponente, { foreignKey: 'articulo_principal', as: 'combo_componentes', onDelete: 'RESTRICT' })
ComboComponente.belongsTo(Articulo, { foreignKey: 'articulo_principal', as: 'articulo_principal1' })

Articulo.hasMany(ComboComponente, { foreignKey: 'articulo', as: 'combos', onDelete: 'RESTRICT' })
ComboComponente.belongsTo(Articulo, { foreignKey: 'articulo', as: 'articulo1' })

Empresa.hasMany(ComboComponente, { foreignKey: 'empresa', as: 'combo_componentes', onDelete: 'RESTRICT' })
ComboComponente.belongsTo(Empresa, { foreignKey: 'empresa', as: 'empresa1' })

Colaborador.hasMany(ComboComponente, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
ComboComponente.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(ComboComponente, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
ComboComponente.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })