const connection = require('../connection');
const usersController = {
    getEquipos: async (req, res) => {
        connection.query('SELECT * FROM cpu_equipo LIMIT 10', (error, results, fields) => {
            if (error) throw error;
            res.json(results);
        });
    },
    getCondicion: async (req, res) => {
        connection.query('SELECT * FROM param_condicion', (error, results, fields) => {
            if (error) throw error;
            res.json(results);
        });
    },
    postCondicion: async (req, res) => {
        connection.query('INSERT INTO param_condicion (nom_condicion) VALUES (\'PRUEBA\')', (error, results, fields) => {
            if (error) throw error;
            res.send('Equipo agregado exitosamente');
        });
    },
    conf_cred: async (req, res) => {
        // Verificar si el usuario y contraseña son válidos
        const { username, password } = req.body;
        console.log('bck: ', username);
        console.log('bck: ', password);
        connection.query('SELECT * FROM usuario WHERE id = ? AND clave = ?', [username, password], (error, results, fields) => {
            if (error) {
                console.error('Error al buscar usuario en la base de datos:', error);
                res.status(500).send('Error interno del servidor');
                return;
            }

            if (results.length > 0) {
                // Usuario autenticado correctamente
                res.json({ success: true });
                console.log('FUNCIONO')
            } else {
                res.json({ success: false });
                // Usuario no encontrado o contraseña incorrecta
                console.log('NO FUNCIONO')
            }
        }
        );
    },

    searchEquipos: async (req, res) => {
        const { query } = req.query;
        const sqlQuery = `SELECT * FROM equipo WHERE 
            CONCAT_WS('', cod_equipo, fec_reg, cod_almacen, tip_equipo, piso_ubic, serv_depar, nom_custodio, nom_usua) LIKE ?`;
        connection.query(sqlQuery, [`%${query}%`], (error, results, fields) => {
            if (error) throw error;
            res.json({ success: true, equipos: results });
        });
    },

};


module.exports = usersController;