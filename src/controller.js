const { emit } = require('nodemon');
const { pool } = require('../dbConfig');
const queries = require('./queries');
const jwtSecret = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');

const getAllClients = async () => {
    return new Promise((resolve, reject) => {
        pool.query(queries.getAllClientes, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.rows);
            }
        });
    });
};

const getClientByEmail = async (email) => {
    return new Promise((resolve, reject) => {
      pool.query(queries.getClienteByEmail, [email], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results.rows[0]);
        }
      });
    });
};

const addClient = async (req, res) => {
    const { name, email, cpf, dob, password, password2, objetivo } = req.body;

    if (password != password2){
        res.status(202).send("Senhas não coincidem");
    } else {
        pool.query(queries.getClienteByEmail, [email], (error, results) => {
            if (error) throw error;
            if (results.rows.length) {
                res.status(202).send("Email already exists.");
                console.log('Email already exists.');
                return;
            }
            
            pool.query(queries.addClient, [name, email, cpf, dob, password, objetivo], (error, results) => {
                if (error) throw error;
                res.status(201).send("Client Created Sucessfully!");
                console.log("Client create");
            });
        });
    }
};

const removeClient = async (req, res)  => {
    const { email } = req.body;

    pool.query(queries.getClienteByEmail, [email], (error, results) => {
        if (error) throw error;
        const noClientFound = !results.rows.length;
        if (noClientFound){
            res.send("Cliente não existe no banco de dados.");
        } else {
            pool.query(queries.deleteClient , [email], (error, results) => {
                if (error) throw error;
                res.status(200).send("Client removed sucessfully.");
            })
        }
    });
};

const updateClient = (req, res) => {
    const {name, email, cpf, dob, password, objetivo} = req.body;

    pool.query(queries.getClienteByEmail, [email], (error, results) => {
        if (error) throw error;
        const noClientFound = !results.rows.length;
        if (noClientFound){
            res.send("Cliente não existe no banco de dados.");
        } else {
            pool.query(queries.updateClient, [name, email, cpf, dob, password, objetivo], (error, results) => {
                if (error) throw error;
                res.status(200).send("Cliente atualizado com sucesso.");
            });
        }
    });
};

const qtdClients = async () => {
    try {
        const results = await pool.query(queries.countClients);
        return results.rows;
    } catch (error) {
        console.log(error);
    }
};

const getTWeight = async (req, res) => {
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, jwtSecret);
        const userEmail = decodedToken.userId;
        
        const results = await pool.query(queries.getTotalWeight, [userEmail]);
        return results.rows;
    } catch (error) {
        console.error('Ocorreu um erro inesperado:', error);
        res.status(500).send('Erro interno do servidor');
    }
}

const updateWeight = (req, res) => {
    const {email, weigth} = req.body; // Recebe o email logado e o peso da solicitação
    pool.query(queries.getClienteByEmail, [email], (error, results) => {
        if (error) throw error;
        const noClientFound = !results.rows.length;
        if (noClientFound){
            res.send("Cliente inexistente.");
        } else {
            pool.query(queries.updateClient, [email, weigth], (error, results) => {
                if (error) throw error;
                res.status(200).send("Peso atualizado com sucesso.");
            });
        }
    });
};

const getAllEquipments = async (req, res) => {
    try {
        const results = await pool.query(queries.getAllEquipments);
        return results.rows;
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

const addEquipment = (req, res) => {
    const { name, email_treinador } = req.body;

    pool.query(queries.getTreinadorByEmail, [email_treinador], (error, results) => {
        if (error) throw error;
        if (!results.rows.length) {
            res.status(202).send("Trainer not exists.");
            console.log('Trainer not exists.');
            return;
        } else {
            pool.query(queries.getEquipmentByPersonal, [email_treinador], (error, result) => {
                if (result.rows.length) {
                    res.status(201).send("The trainer already has equipment.");
                    console.log("The trainer already has equipment.");
                } else {
                    pool.query(queries.addEquipment, [name, email_treinador], (error, results) => {
                        if (error) throw error;
                        res.status(201).send("Equipment Created Sucessfully");
                        console.log('Equipment Created Sucessfully');
                    });
                }
            });
        }
    });
};

const removeEquipment = async (req, res)  => {
    const id = req.params.id;

    pool.query(queries.getEquipmentByID, [id], (error, results) => {
        if (error) throw error;
        const noEquipFound = !results.rows.length;
        if (noEquipFound){
            res.send("Equipment does not exist in the database.");
        } else {
            pool.query(queries.deleteEquipment, [id], (error, results) => {
                if (error) throw error;
                res.status(200).send("Equipment removed sucessfully.");
            })
        }
    });
};

const updateEquipment = (req, res) => {
    const id = req.params.id;
    const {name, email_treinador} = req.body;

    pool.query(queries.getEquipmentByID, [id], (error, results) => {
        if (error) throw error;
        const noEquipmentFound = !results.rows.length;
        if (noEquipmentFound){
            res.send("Equipamento inexistente no banco de dados.");
        } else {
            pool.query(queries.updateEquipment, [id, name, email_treinador], (error, results) => {
                if (error) throw error;
                res.status(200).send("Equipamento atualizado com sucesso.");
            });
        }
    });
};

const getEquipmentByPersonal = async (req, res) => {
    try {
        const email = req.params.email;
        
        const equip = await pool.query(queries.getEquipmentByPersonal, [email]);
        return equip.rows;

    } catch (error) {
        console.log(error);
    }
};

const getEquipmentById = async (req, res) => {
    try {
        const id = req.params.id;
        const equip = await pool.query(queries.getEquipmentByID, [id]);
        return equip.rows;
    } catch (error) {
        console.log(error);
    }
};

const qtdEquipments = async () => {
    try {
        const results = await pool.query(queries.countEquipments);
        return results.rows;
    } catch (error) {
        console.log(error);
    }
};


const getClientsUseEquip = async (req, res, equipId, data) => {
    try {
        const results = await pool.query(queries.getClientesWorkoutDayAndEquip, [data, equipId]);
        return results.rows;
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocorreu um erro ao buscar os dados');
    }
};

const getClientsUseEquipThisMonth = async (req, res, equipId, data) => {
    try {
        const results = await pool.query(queries.getClientesWorkoutMonthAndEquip, [data, equipId]);
        return results.rows;
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocorreu um erro ao buscar os dados');
    }
};

const getClientsUseEquipMostThisYear = async (req, res, equipId, data) => {
    try {
        const results = await pool.query(queries.getClientesWorkoutYearAndEquip, [data, equipId]);
        return results.rows;
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocorreu um erro ao buscar os dados');
    }
};

const getAllTrainers = async (req, res) => {
    try {
        const results = await pool.query(queries.getAllTreinadores);
        return results.rows;
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro interno do servidor");
    }
};

const getTrainerByEmail = async (email) => {
    return new Promise((resolve, reject) => {
        pool.query(queries.getTreinadorByEmail, [email], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.rows[0]);
            }
        })
    })
};

const addTrainer = async (req, res) => {
    const { name, email, cpf, dob, password, password2, salario } = req.body;

    if (password != password2){
        res.status(202).send("Password doesnt match");
    } else {
        pool.query(queries.getTreinadorByEmail, [email], (error, results) => {
            if (error) throw error;
            if (results.rows.length) {
                res.status(202).send("Email already exists.");
                console.log('Email already exists.');
                return;
            }
            
            pool.query(queries.countTrainersCPF, [cpf], (error, result) => {
                if (error) throw error;
                let validation = parseInt(result.rows[0].cpf_trainer);
                if (validation == '1') {
                    res.status(202).send("CPF already exists");
                    console.log('CPF already exists');
                } else {
                    pool.query(queries.addTreinador, [email, cpf, name, dob, password, salario], (error, results) => {
                        if (error) throw error;
                        res.status(201).send("Trainer Created Sucessfully!");
                        console.log("Trainer create");
                    });
                }
            });
            
        });
    }
};


const removeTrainer = async (req, res)  => {
    const email = req.params.email;

    pool.query(queries.getTreinadorByEmail, [email], (error, results) => {
        if (error) throw error;
        const noTrainerFound = !results.rows.length;
        if (noTrainerFound){
            res.send("Trainer does not exist in the database.");
        } else {
            pool.query(queries.deleteTrainer, [email], (error, results) => {
                if (error) throw error;
                res.status(200).send("Trainer removed sucessfully.");
            })
        }
    });
};

const countEquipByTrainer = async (req, res) => {
    const email = req.params.email;
    pool.query(queries.countEquipByTrainer, [email], (error, result) => {
        if (error) throw error;
        console.log(result.rows[0].count);
        return result.rows[0].count;
    })
};

const updateTrainer = (req, res) => {
    const email = req.params.email;
    const { name, new_email, cpf, dob, password, password2, password3, salario } = req.body;
    pool.query(queries.getSenhaByEmail, [email], (error, resultado) => {
        if (error) throw error;
        if (password3 == resultado.rows[0].senha) {     
            if (password == password2) {
                pool.query(queries.getTreinadorByEmail, [email], (error, result) => {
                    if (error) throw error;
                    const noTrainerFound = !result.rows.length;
                    if (noTrainerFound){
                        res.send("Trainer does not exist in the database.");
                    } else {
                        pool.query(queries.updateTrainer, [name, new_email, cpf, dob, password, salario], (error, results) => {
                            if (error) throw error;
                            res.status(200).send("Trainer updated sucessfully.");
                            console.log("Trainer updated sucessfully");
                        });
                    }
                });
            } else {
                res.send("Senhas não batem");
                console.log("Senhas não batem");
            }
        } else {
            res.send("Senha antiga incorreta");
            console.log("Senha antiga incorreta");
        }
    });
};

const qtdTrainers = async () => {
    try {
        const results = await pool.query(queries.countTrainers);
        return results.rows;
    } catch (error) {
        console.log(error);
    }
};

const registrarUso = async (req, res) => {
    try {
        const equipId = req.params.id;
        const { data, email, peso, repeticao } = req.body;
        pool.query(queries.registerUse, [data, email, equipId, peso, repeticao], (error, results) => {
            if (error) console.log(error);
            res.status(201).send("Register Sucessfully!");
            console.log("Register Sucessfully!");
        });
    } catch (error) {
        console.log(error);
    }
};


module.exports = {
    getAllClients,
    getClientByEmail,
    addClient,
    getTWeight,
    updateWeight,
    removeClient,
    removeEquipment,
    removeTrainer,
    updateClient,
    updateEquipment,
    updateTrainer,
    getAllEquipments,
    addEquipment,
    getAllTrainers,
    getEquipmentByPersonal,
    getEquipmentById,
    getTrainerByEmail,
    addTrainer,
    getClientsUseEquip,
    getClientsUseEquipThisMonth,
    getClientsUseEquipMostThisYear,
    qtdClients,
    qtdEquipments,
    qtdTrainers,
    countEquipByTrainer,
    registrarUso,
};