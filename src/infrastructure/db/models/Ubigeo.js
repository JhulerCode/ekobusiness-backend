import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Colaborador } from './Colaborador.js'

export const Ubigeo = sequelize.define('ubigeos', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    codigo: { type: DataTypes.STRING },
    departamento: { type: DataTypes.STRING },
    provincia: { type: DataTypes.STRING },
    distrito: { type: DataTypes.STRING },

    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },

    nombre: {
        type: DataTypes.VIRTUAL,
        get() {
            const departamento = this.departamento || ''
            const provincia = this.provincia || ''
            const distrito = this.distrito || ''
            return `${departamento} - ${provincia} - ${distrito}`.trim()
        }
    }
})

Colaborador.hasMany(Ubigeo, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
Ubigeo.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(Ubigeo, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
Ubigeo.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })