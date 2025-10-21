import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'

export const DerechoArco = sequelize.define('derecho_arcos', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    nombres: { type: DataTypes.STRING },
    apellidos: { type: DataTypes.STRING },
    doc_tipo: { type: DataTypes.STRING },
    doc_numero: { type: DataTypes.STRING },
    doc_file: { type: DataTypes.JSON, defaultValue: {} },
    email: { type: DataTypes.STRING },
    domicilio: { type: DataTypes.STRING },
    rep_nombres: { type: DataTypes.STRING },
    rep_apellidos: { type: DataTypes.STRING },
    rep_dot_tipo: { type: DataTypes.STRING },
    rep_doc_numero: { type: DataTypes.STRING },
    rep_doc_file: { type: DataTypes.JSON, defaultValue: {} },
    tipo: { type: DataTypes.STRING },
    detalle: { type: DataTypes.TEXT },
    extras_doc: { type: DataTypes.JSON, defaultValue: {} },
})