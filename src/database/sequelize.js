import { Sequelize } from 'sequelize'
import config from '../config.js'
import mysql from 'mysql2' // Es necesario importar
const conn = mysql // Es necesario esta variable

const options = {
    dialect: 'mysql',
    logging: false,
}

const sequelize = new Sequelize(config.dbUri, options)

export default sequelize