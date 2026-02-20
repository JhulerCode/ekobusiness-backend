import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Socio } from './Socio.js'
import { Articulo } from './Articulo.js'
import { Colaborador } from './Colaborador.js'
import { arrayMap } from '#store/system.js'

const helpdesk_estados_map = arrayMap('helpdesk_estados')

export const HelpdeskTicket = sequelize.define('helpdesk_tickets', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nombre: { type: DataTypes.STRING },
    descripcion: { type: DataTypes.TEXT },
    socio: { type: DataTypes.STRING },
    articulo: { type: DataTypes.STRING },
    estado: { type: DataTypes.STRING },

    reclamo_fecha: { type: DataTypes.DATEONLY },
    reclamo_fuente: { type: DataTypes.STRING },

    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },

    estado1: {
        type: DataTypes.VIRTUAL,
        get() {
            const estado = this.estado || ''
            return helpdesk_estados_map[estado] || ''
        },
    },
})

Socio.hasMany(HelpdeskTicket, { foreignKey: 'socio', as: 'helpdesk_tickets', onDelete: 'RESTRICT' })
HelpdeskTicket.belongsTo(Socio, { foreignKey: 'socio', as: 'socio1' })

Articulo.hasMany(HelpdeskTicket, { foreignKey: 'articulo', as: 'helpdesk_tickets', onDelete: 'RESTRICT' })
HelpdeskTicket.belongsTo(Articulo, { foreignKey: 'articulo', as: 'articulo1' })

Colaborador.hasMany(HelpdeskTicket, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
HelpdeskTicket.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(HelpdeskTicket, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
HelpdeskTicket.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })
