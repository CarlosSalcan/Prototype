const connection = require('../connection');

const parametroController = {
    getParametros: async (req, res) => {
        try {
            const { tabla } = req.params;

            const results = await new Promise((resolve, reject) => {
                connection.query(`SELECT * FROM ${tabla}`, (error, results, fields) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(results);
                });
            });

            // Enviar los resultados como respuesta
            res.json({ success: true, parametros: results });
        } catch (error) {
            console.error('Error al obtener los parámetros:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
    },

    borrarParametro: async (req, res) => {
        try {
            const { tabla, campo, valor } = req.params;

            const result = await new Promise((resolve, reject) => {
                connection.query(`DELETE FROM ${tabla} WHERE ${campo} = ?`, [valor], (error, results, fields) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(results);
                });
            });

            // Comprobar si se borró algún registro
            if (result.affectedRows === 0) {
                res.status(404).json({ success: false, message: 'No se encontró ningún registro para borrar' });
                return;
            }

            // Enviar una respuesta exitosa
            res.json({ success: true, message: 'Registro borrado correctamente' });
        } catch (error) {
            console.error('Error al borrar el registro:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
    },

    editarNombreParametro: async (req, res) => {
        try {
            const { tabla, campo, valor, nuevoNombre } = req.params;

            // Verificar si el nuevo nombre ya existe en la tabla
            const countResult = await new Promise((resolve, reject) => {
                connection.query(`SELECT COUNT(*) AS count FROM ${tabla} WHERE ${campo} = ? AND ${campo} <> ?`, [nuevoNombre, valor], (error, results, fields) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(results);
                });
            });

            const count = countResult[0].count;
            if (count > 0) {
                res.status(400).json({ success: false, message: 'El nombre ingresado ya existe en la tabla' });
                return;
            }

            // Actualizar el registro en la tabla especificada
            const result = await new Promise((resolve, reject) => {
                connection.query(`UPDATE ${tabla} SET ${campo} = ? WHERE ${campo} = ?`, [nuevoNombre, valor], (error, results, fields) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(results);
                });
            });

            if (result.affectedRows === 0) {
                res.status(404).json({ success: false, message: 'No se encontró ningún registro para modificar' });
                return;
            }

            // Actualizar registros en las tablas equipo y laptop
            const updateQueries = [
                //-------------------------------> PARAM ANTIVIRUS
                { table: 'param_antivirus', field: 'nom_antivirus' },
                { table: 'cpu_equipo', field: 'nom_antivirus' },
                { table: 'laptop', field: 'nom_antv_laptop' },
                //-------------------------------> VENTANA CARGO
                { table: 'param_cargo', field: 'nom_cargo' },
                //-------------------------------> PARAM CONDICION
                { table: 'param_condicion', field: 'nom_condicion' },
                { table: 'cpu_equipo', field: 'con_cpu' },
                { table: 'impresora', field: 'con_imp' },
                { table: 'monitor', field: 'con_monitor' },
                { table: 'mouse', field: 'con_mouse' },
                { table: 'teclado', field: 'con_teclado' },
                { table: 'telefono', field: 'con_telf' },
                //-------------------------------> PARAM DISP OPTICOS
                { table: 'param_dis_opt', field: 'nom_dis_opt' },
                { table: 'cpu_equipo', field: 'disp_optico' },
                { table: 'laptop', field: 'dop_laptop' },
                //-------------------------------> PARAM ESTADO
                { table: 'param_estado', field: 'nom_estado' },
                { table: 'cpu_equipo', field: 'est_cpu' },
                { table: 'impresora', field: 'est_imp' },
                { table: 'laptop', field: 'est_laptop' },
                { table: 'monitor', field: 'est_monitor' },
                { table: 'mouse', field: 'est_mouse' },
                { table: 'teclado', field: 'est_teclado' },
                { table: 'telefono', field: 'est_telf' },
                //-------------------------------> PARAM MARCAS
                { table: 'param_marcas', field: 'nom_marcas' },
                { table: 'cpu_equipo', field: 'mar_cpu' },
                { table: 'impresora', field: 'mar_imp' },
                { table: 'laptop', field: 'mar_laptop' },
                { table: 'monitor', field: 'mar_monitor' },
                { table: 'mouse', field: 'mar_mouse' },
                { table: 'teclado', field: 'mar_teclado' },
                { table: 'telefono', field: 'mar_telf' },
                //-------------------------------> PARAM RAM
                { table: 'param_memoria', field: 'nom_memoria' },
                { table: 'cpu_equipo', field: 'memoria' },
                { table: 'laptop', field: 'mem_laptop' },
                //-------------------------------> PARAM NUM DISCOS
                { table: 'param_num_hdd', field: 'nom_n_hdd' },
                //-------------------------------> PARAM OFFICE
                { table: 'param_office', field: 'nom_office' }
            ];

            // Ejecutar las consultas de actualización en ambas tablas
            await Promise.all(updateQueries.map(async (query) => {
                const updateResult = await new Promise((resolve, reject) => {
                    connection.query(`UPDATE ${query.table} SET ${query.field} = ? WHERE ${query.field} = ?`, [nuevoNombre, valor], (error, results, fields) => {
                        if (error) {
                            reject(error);
                            return;
                        }
                        resolve(results);
                    });
                });
                if (updateResult.affectedRows === 0) {
                    console.log(`No se encontraron registros para actualizar en la tabla ${query.table}`);
                }
            }));

            res.json({ success: true, message: 'Nombre del registro modificado correctamente' });
        } catch (error) {
            console.error('Error al modificar el nombre del registro:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
    },

    nuevoParametro: async (req, res) => {
        try {
            const { tabla } = req.params;
            const { nombreParametro } = req.body;
            let nombreCampo;

            // Asignar el nombre del campo en la base de datos según la tabla seleccionada
            if (tabla === 'param_antivirus') {
                nombreCampo = 'nom_antivirus';
            } else if (tabla === 'param_marcas') {
                nombreCampo = 'nom_marca';
            } else if (tabla === 'param_memoria') {
                nombreCampo = 'nom_memoria';
            } else if (tabla === 'param_office') {
                nombreCampo = 'nom_office';
            } else if (tabla === 'param_procesador') {
                nombreCampo = 'nom_proce';
            } else if (tabla === 'param_servicio') {
                nombreCampo = 'nom_servicio';
            } else if (tabla === 'param_sis_ope') {
                nombreCampo = 'nom_sis_ope';
            } else if (tabla === 'param_tamano_hdd') {
                nombreCampo = 'nom_tam_hdd';
            }

            const query = `INSERT INTO ${tabla} (${nombreCampo}) VALUES (?)`;
            const result = await new Promise((resolve, reject) => {
                connection.query(query, [nombreParametro], (error, results, fields) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(results);
                });
            });

            res.json({ success: true, message: `Parámetro insertado correctamente en la tabla ${tabla}` });
        } catch (error) {
            console.error('Error al insertar nuevo parámetro:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
    }
}
module.exports = parametroController;
