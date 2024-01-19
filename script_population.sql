CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS CLIENTE CASCADE;

CREATE TABLE CLIENTE (
	email		VARCHAR(30)				NOT NULL,
	cpf			VARCHAR(14)				NOT NULL,
	nome		VARCHAR(50)				NOT NULL,
	data		DATE,
	senha		VARCHAR(60)				NOT NULL,
	objetivo	FLOAT 					NOT NULL,
	PRIMARY KEY (email),
	UNIQUE (email),
	UNIQUE (cpf)
);

INSERT INTO CLIENTE
   VALUES
   ('joana@gmail.com', '444.444.444-44', 'Joana Silva', '1990-12-15', '$2b$10$TeFhP6TunpWpMPiVycj8MegI5os77i/mngmNYd.Zrh78uTZKRirMW', 1000),
   ('lucas@gmail.com', '555.555.555-55', 'Lucas Oliveira', '1985-05-20', '$2b$10$23H26/MtpV302luPaBi4BugdjR76xA2.OU8SYQwCGQOZjOMWSODcW', 700),
   ('maria@gmail.com', '666.666.666-66', 'Maria Souza', '2000-08-10', '$2b$10$70qYd13uDHfuv1ls/ZrEO.3MLBTgPowRvOcpNBrN3z/fQzka4sdHe', 400);

DROP TABLE IF EXISTS TREINADOR CASCADE;

CREATE TABLE TREINADOR (
	email		VARCHAR(30)		NOT NULL,
	cpf			VARCHAR(14)		NOT NULL,
	nome		VARCHAR(50)		NOT NULL,
	data		DATE,
	senha		VARCHAR(60)		NOT NULL,
	salario		INTEGER			NOT NULL,
	PRIMARY KEY (email),
	UNIQUE (email),
	UNIQUE (cpf)
);

 INSERT INTO TREINADOR
   VALUES
   ('julho@gmail.com', '111.111.111-11', 'Julho Balestrini', '1944-07-05', '$2b$10$zZbdR2Xq7atxlsnXZ9SGtekTKNhYEL4oEc20Xi8cswJ0f2Q2nXhL2', 100000),
   ('amanda@gmail.com', '222.222.222-22', 'Amanda Nunes', NULL, '$2b$10$PjxuY/ScFeq1yiZm5BCz.eDt0W67gm9FVc8zPYD8.ytODH4nwoCjy', 90000),
   ('carlos@gmail.com', '333.333.333-33', 'Carlos Almeida', '1980-03-02', '$2b$10$mGXKbxiMvYyrJzG4EGsOru7MjtbHSALr453VBOu0mvRQaSZI7lJbC', 80000);
  
DROP TABLE IF EXISTS EQUIPAMENTO CASCADE;

CREATE TABLE EQUIPAMENTO (
	id				UUID DEFAULT uuid_generate_v4 ()	NOT NULL,
	nome 			VARCHAR(30)	NOT NULL,
	email_treinador VARCHAR(30)	NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (email_treinador) REFERENCES TREINADOR (email)
		ON UPDATE CASCADE
		ON DELETE SET NULL
);

INSERT INTO EQUIPAMENTO
   VALUES
   ('1a227ae0-a190-11ee-8c90-0242ac120002', 'Esteira', 'julho@gmail.com'),
   ('1a227ae0-a190-11ee-8c90-0242ac120003', 'Bicicleta Ergométrica', 'amanda@gmail.com'),
   ('1a227ae0-a190-11ee-8c90-0242ac120004', 'Supino', 'carlos@gmail.com');

DROP TABLE IF EXISTS USA CASCADE;

CREATE TABLE USA (
	data 			DATE		NOT NULL,
	email_cliente	VARCHAR(30)	NOT NULL,
	id_equip		UUID		NOT NULL,
	peso			INTEGER,
	repeticao		INTEGER		NOT NULL,
	PRIMARY KEY (data, email_cliente, id_equip),
	FOREIGN KEY (email_cliente) REFERENCES CLIENTE (email)
		ON UPDATE CASCADE
		ON DELETE CASCADE,
	FOREIGN KEY (id_equip) REFERENCES EQUIPAMENTO (id)
		ON UPDATE CASCADE
		ON DELETE CASCADE
);


INSERT INTO USA
   VALUES
   ('2023-01-10', 'joana@gmail.com', '1a227ae0-a190-11ee-8c90-0242ac120002', 60, 12),
   ('2023-01-12', 'lucas@gmail.com', '1a227ae0-a190-11ee-8c90-0242ac120003', 80, 10),
   ('2023-01-15', 'maria@gmail.com', '1a227ae0-a190-11ee-8c90-0242ac120004', 50, 15);
  
