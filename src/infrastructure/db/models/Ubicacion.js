import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Colaborador } from './Colaborador.js'

export const Ubicacion = sequelize.define('ubicaciones', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nombre: { type: DataTypes.STRING }, // required
    tipo: { type: DataTypes.STRING }, // internal, view, customer, inventory, production, transit
    padre: { type: DataTypes.STRING },

    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },
})

Ubicacion.hasMany(Ubicacion, { foreignKey: 'padre', as: 'hijas', onDelete: 'RESTRICT' })
Ubicacion.belongsTo(Ubicacion, { foreignKey: 'padre', as: 'padre1' })

Colaborador.hasMany(Ubicacion, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
Ubicacion.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(Ubicacion, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
Ubicacion.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })
