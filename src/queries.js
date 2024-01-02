// PESQUISAS DENTRO DO BANCO DE DADOS

// -> Cliente
const addClient = `
    INSERT INTO cliente 
    (zz, email, cpf, data, senha, objetivo) 
    VALUES ($1, $2, $3, $4, $5, $6)`;

const getAllClientes = `
    SELECT * 
    FROM cliente`;

const getClienteByEmail = `
    SELECT * 
    FROM CLIENTE 
    WHERE email = $1`;

// Selecionar clientes que treinaram em determinado dia
const getClientesWorkoutDay = `
    SELECT c.* 
    FROM cliente c, usa u 
    WHERE u.email_cliente = c.email AND u.data = $1
`;

// Selecionar o cliente que pega mais peso no equipamento (id)
const getClientStrongerEquipById = `
    SELECT c 
    FROM cliente c, usa u 
    WHERE c.email = u.email_cliente AND u.id_equip = $1 AND u.peso > ALL (SELECT u1.peso FROM usa u1 WHERE u1.id_equip = $1)
`;

// Selecionar o cliente que treinou todos os dias do mês
const getClientesWorkoutMonthly = `
    SELECT c.* 
    FROM cliente c 
    WHERE NOT EXISTS (
        SELECT DISTINCT d 
        FROM generate_series('2023-01-01'::date, '2023-01-31'::date, '1 day'::interval) d 
        EXCEPT SELECT u.data FROM usa u 
        WHERE u.email_cliente = c.email
    )
`;

// Selecionar todos os clientes que treinaram no dia (x) e usaram o equipamenteo (y)
const getClientesWorkoutDayAndEquip = `
    SELECT c.nome, c.email, c.objetivo 
    FROM cliente c, usa u 
    WHERE u.data = $1 AND u.id_equip = $2 AND u.email_cliente = c.email
`;

// chat que fez, tem que ver se ta certo
const getClientesWorkoutMonthAndEquip = `
    SELECT c.nome, c.email, c.objetivo 
    FROM cliente c, usa u 
    WHERE DATE_PART('month', u.data::timestamp) = DATE_PART('month', $1::timestamp) AND u.id_equip = $2 AND u.email_cliente = c.email
`;

// chat que fez, tem que ver se ta certo
const getClientesWorkoutYearAndEquip = `
    SELECT c.nome, c.email, c.objetivo, COUNT(*) as usage_count 
    FROM cliente c, usa u 
    WHERE DATE_PART('year', u.data::timestamp) = DATE_PART('year', $1::timestamp) AND u.id_equip = $2 AND u.email_cliente = c.email 
    GROUP BY c.nome, c.email, c.objetivo 
    ORDER BY usage_count DESC 
    LIMIT 1
`;

const updateClient = `
    UPDATE cliente 
    SET email = $1, cpf = $2, nome = $3, data = $4, senha = $5, objetivo = $6 
    WHERE email = $7
`;

const deleteClient = `
    DELETE FROM cliente 
    WHERE email = $1
`;

const countClients = `
    SELECT COUNT(c.cpf) 
    FROM cliente c
`;

// Peso total levantado no mes
const getTotalWeight = `
    SELECT
        TO_CHAR(data, 'YYYY/MM') AS month_year,
        SUM(peso * repeticao) AS total_peso
    FROM USA
    WHERE email_cliente = $1
    GROUP BY month_year
    ORDER BY month_year DESC;
`;

const updateWeight = `
    UPDATE CLIENTE
    SET objetivo = $1
    WHERE email = $2;
`;

// -> Treinador
const addTreinador = `
    INSERT INTO treinador (email, cpf, nome, data, senha, salario) 
    VALUES ($1, $2, $3, $4, $5, $6)
`;

const getAllTreinadores = `
    SELECT * 
    FROM treinador
`;

const getTreinadorByEmail = `
    SELECT * 
    FROM treinador t 
    WHERE t.email = $1
`;

// Selecionar qual treinador cuida do equipamento (id)
const getTreinadorCareEquip = `
    SELECT t 
    FROM treinador t, equipamento e 
    WHERE t.email = e.email_treinador AND e.id = $1
`;

// Selecionar qual treinador recebe mais
const getTreinadorMore = `
    SELECT t 
    FROM treinador t 
    WHERE t.salario > ALL (SELECT t1.salario FROM treinador t1)
`;

// Retornar o email de todos os treinadores
const getAllEmailsTreinadores = `
    SELECT t.email 
    FROM treinador t
`;

// Retornar a quantidade de treinadores com o cpf = $1
const countTrainersCPF = `
    SELECT COUNT (*) as cpf_trainer 
    FROM treinador t 
    WHERE t.cpf = $1
`;

const updateTrainer = `
    UPDATE treinador 
    SET email = $1, cpf = $2, nome = $3, data = $4, senha = $5, salario = $6 
    WHERE email = $1
`;

const deleteTrainer = `
    DELETE FROM treinador 
    WHERE email = $1
`;

const countTrainers = `
    SELECT COUNT(t.cpf) 
    FROM treinador t
`;

// Retornar a senha do treinador a partir do email (porque??)
const getSenhaByEmail = `
    SELECT t.senha 
    FROM treinador t 
    WHERE t.email = $1
`;

// -> Equipamento
const addEquipment = `
    INSERT INTO equipamento (nome, email_treinador) 
    VALUES ($1, $2)
`;

const getAllEquipments = `
    SELECT * 
    FROM equipamento
`;

const getEquipmentByID = `
    SELECT * 
    FROM equipamento e 
    WHERE e.id = $1
`;

// Selecionar o equipamento mais utilizado na data (x)
const getMostUsedEquipmentByDate = `
    SELECT e.*, COUNT(u.id_equip) AS quantidade_utilizada 
    FROM equipamento e 
    JOIN usa u ON e.id = u.id_equip 
    WHERE u.data = $1 
    GROUP BY e.id 
    ORDER BY quantidade_utilizada DESC 
    LIMIT 1
`;

// Selecionar o equipamento que o treinador (email) cuida
const getEquipmentByPersonal = `
    SELECT e.* 
    FROM equipamento e, treinador t 
    WHERE t.email = $1 AND e.email_treinador = t.email
`;

const updateEquipment = `
    UPDATE equipamento 
    SET id = $1, nome = $2, email_treinador = $3 
    WHERE id = $1
`;

const deleteEquipment = `
    DELETE FROM equipamento 
    WHERE id = $1
`;

// Retorna a quantidade de equipamentos
const countEquipments = `
    SELECT COUNT(e.id) 
    FROM equipamento e
`;

// conta os
const countEquipByTrainer = `
    SELECT COUNT(e.id) 
    FROM equipamento e 
    WHERE e.email_treinador = $1
`;


// -> Usa

// 
const registerUse = "INSERT INTO usa (data, email_cliente, id_equip, peso, repeticao) VALUES ($1, $2, $3, $4, $5)"


module.exports = {
    addClient,
    addEquipment,
    addTreinador,
    getAllClientes,
    updateEquipment,
    updateClient,
    updateTrainer,
    updateWeight,
    getClienteByEmail,
    getClientesWorkoutDay,
    getClientStrongerEquipById,
    getClientesWorkoutMonthly,
    getClientesWorkoutDayAndEquip,
    getTotalWeight,
    getAllTreinadores,
    getTreinadorByEmail,
    getTreinadorCareEquip,
    getTreinadorMore,
    getAllEquipments,
    getEquipmentByID,
    getMostUsedEquipmentByDate,
    getEquipmentByPersonal,
    countTrainersCPF,
    getAllEmailsTreinadores,
    getClientesWorkoutMonthAndEquip,
    getClientesWorkoutYearAndEquip, 
    deleteEquipment,
    deleteTrainer,
    deleteClient,
    countClients,
    countTrainers,
    countEquipments,
    getSenhaByEmail,
    countEquipByTrainer,
    registerUse,
};