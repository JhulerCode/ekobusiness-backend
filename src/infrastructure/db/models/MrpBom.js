import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Articulo } from './Articulo.js'
import { Colaborador } from './Colaborador.js'
import { arrayMap } from '#store/system.js'

export const MrpBom = sequelize.define('mrp_boms', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    articulo: { type: DataTypes.STRING }, //required //linked
    tipo: { type: DataTypes.STRING }, //required
    // cantidad: { type: DataTypes.DOUBLE }, //required

    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },

    tipo1: {
        type: DataTypes.VIRTUAL,
        get() {
            const mrp_bom_tiposMap = arrayMap('mrp_bom_tipos')
            return mrp_bom_tiposMap[this.tipo]
        },
    },
})

Articulo.hasMany(MrpBom, { foreignKey: 'articulo', as: 'mrp_boms', onDelete: 'RESTRICT' })
MrpBom.belongsTo(Articulo, { foreignKey: 'articulo', as: 'articulo1' })

Colaborador.hasMany(MrpBom, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
MrpBom.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(MrpBom, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
MrpBom.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })
