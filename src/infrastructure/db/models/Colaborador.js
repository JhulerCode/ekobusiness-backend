import sequelize from '../sequelize.js'
import { DataTypes } from 'sequelize'
import { Empresa } from './Empresa.js'
import { arrayMap } from '#store/system.js'
import { formatDate } from '#shared/dayjs.js'

const systemMaps = {
    generos: arrayMap('generos'),
    documentos_identidad: arrayMap('documentos_identidad'),
    estados: arrayMap('estados'),
}

export const Colaborador = sequelize.define('colaboradores', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nombres: { type: DataTypes.STRING }, //required

    doc_tipo: { type: DataTypes.STRING }, //required
    doc_tipo1: {
        type: DataTypes.VIRTUAL,
        get() {
            return systemMaps.documentos_identidad[this.getDataValue('doc_tipo')]
        },
    },
    doc_numero: { type: DataTypes.STRING }, //required

    fecha_nacimiento: { type: DataTypes.DATEONLY },
    fecha_nacimiento1: {
        type: DataTypes.VIRTUAL,
        get() {
            return formatDate(this.getDataValue('fecha_nacimiento'))
        },
    },
    sexo: { type: DataTypes.STRING },
    sexo1: {
        type: DataTypes.VIRTUAL,
        get() {
            return systemMaps.generos[this.getDataValue('sexo')]
        },
    },

    correo: { type: DataTypes.STRING },
    telefono: { type: DataTypes.STRING },
    ubigeo: { type: DataTypes.STRING }, //required
    direccion: { type: DataTypes.STRING },

    cargo: { type: DataTypes.STRING }, //required
    sueldo: { type: DataTypes.DOUBLE },
    activo: { type: DataTypes.BOOLEAN },
    activo1: {
        type: DataTypes.VIRTUAL,
        get() {
            return systemMaps.estados[this.getDataValue('activo')]
        },
    },

    produccion_codigo: { type: DataTypes.STRING },

    has_signin: { type: DataTypes.BOOLEAN }, //required
    has_signin1: {
        type: DataTypes.VIRTUAL,
        get() {
            return systemMaps.estados[this.getDataValue('has_signin')]
        },
    },
    usuario: { type: DataTypes.STRING }, //required
    contrasena: { type: DataTypes.STRING }, //required
    permisos: { type: DataTypes.JSON }, //required
    vista_inicial: { type: DataTypes.STRING },

    lastSignin: { type: DataTypes.DATE },
    lastUpdatePassword: { type: DataTypes.DATE },

    theme: { type: DataTypes.STRING, defaultValue: '1' },
    color: { type: DataTypes.STRING, defaultValue: '#2492c2' },
    format_date: { type: DataTypes.STRING, defaultValue: 'DD-MM-YYYY' },
    menu_visible: { type: DataTypes.BOOLEAN, defaultValue: true },

    tables: { type: DataTypes.JSON, defaultValue: {} },
    avances: { type: DataTypes.JSON, defaultValue: {} },

    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },
})

Empresa.hasMany(Colaborador, { foreignKey: 'empresa', as: 'colaboradores', onDelete: 'RESTRICT' })
Colaborador.belongsTo(Empresa, { foreignKey: 'empresa', as: 'empresa1' })

Colaborador.belongsTo(Colaborador, {
    foreignKey: 'createdBy',
    as: 'createdBy1',
    onDelete: 'RESTRICT',
})
Colaborador.belongsTo(Colaborador, {
    foreignKey: 'updatedBy',
    as: 'updatedBy1',
    onDelete: 'RESTRICT',
})
