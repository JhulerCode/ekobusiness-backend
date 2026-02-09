import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Socio } from './Socio.js'
import { MrpBom } from './MrpBom.js'
import { Colaborador } from './Colaborador.js'

export const MrpBomSocio = sequelize.define('mrp_bom_socios', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    socio: { type: DataTypes.STRING },
    mrp_bom: { type: DataTypes.STRING },
    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },
})

Socio.hasMany(MrpBomSocio, { foreignKey: 'socio', as: 'mrp_bom_socios', onDelete: 'RESTRICT' })
MrpBomSocio.belongsTo(Socio, { foreignKey: 'socio', as: 'socio1' })

MrpBom.hasMany(MrpBomSocio, { foreignKey: 'mrp_bom', as: 'mrp_bom_socios', onDelete: 'RESTRICT' })
MrpBomSocio.belongsTo(MrpBom, { foreignKey: 'mrp_bom', as: 'mrp_bom1' })

Colaborador.hasMany(MrpBomSocio, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
MrpBomSocio.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(MrpBomSocio, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
MrpBomSocio.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })
