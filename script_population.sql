CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS CLIENTE CASCADE;

CREATE TABLE CLIENTE (
	email		VARCHAR(30)				NOT NULL,
	cpf			VARCHAR(14)				NOT NULL,
	nome		VARCHAR(50)				NOT NULL,
	data		DATE	CHECK (data BETWEEN CURRENT_DATE - INTERVAL '150 years' AND CURRENT_DATE),
	senha		VARCHAR(60)				NOT NULL,
	objetivo	FLOAT 					NOT NULL,
	PRIMARY KEY (email),
	UNIQUE (email),
	UNIQUE (cpf)
);

INSERT INTO CLIENTE
   VALUES
   ('joana@gmail.com', '444.444.444-44', 'Joana Silva', '1990-12-15', '$2b$10$ayiZSiCMWstXLF4VyKzkr.EoEmh1NE/pfiGYsarso9yYlPZ9.m70e', 1000), -- senha: 123456
   ('lucas@gmail.com', '555.555.555-55', 'Lucas Oliveira', '1985-05-20', '$2b$10$23H26/MtpV302luPaBi4BugdjR76xA2.OU8SYQwCGQOZjOMWSODcW', 700),
   ('maria@gmail.com', '666.666.666-66', 'Maria Souza', '2000-08-10', '$2b$10$70qYd13uDHfuv1ls/ZrEO.3MLBTgPowRvOcpNBrN3z/fQzka4sdHe', 400),
   ('ana@gmail.com', '777.777.777-77', 'Ana Santos', '1988-06-25', '$2b$10$3Gmc5HTRl.Nt0x2gJZkpMejOHQsRDRgO2C33H1sq7x77qBoI3kT/u', 1200),
   ('roberto@gmail.com', '888.888.888-88', 'Roberto Pereira', '1995-02-18', '$2b$10$TjIT1f1pzOPE9A0gsUO6.Ov0RTJ7AV2dIbdDoy8DD2t7W9XsP77CS', 900),
   ('carolina@gmail.com', '999.999.999-99', 'Carolina Lima', '1983-11-30', '$2b$10$MU.1/6REBqHicYdZ0G/I7.tnHPfXc1V4fFQUyODoDtbwQDLUBqSby', 1500);

DROP TABLE IF EXISTS TREINADOR CASCADE;

CREATE TABLE TREINADOR (
	email		VARCHAR(30)		NOT NULL,
	cpf			VARCHAR(14)		NOT NULL,
	nome		VARCHAR(50)		NOT NULL,
	data		DATE	CHECK (data BETWEEN CURRENT_DATE - INTERVAL '150 years' AND CURRENT_DATE),
	senha		VARCHAR(60)		NOT NULL,
	salario		INTEGER			NOT NULL,
	PRIMARY KEY (email),
	UNIQUE (email),
	UNIQUE (cpf)
);

 INSERT INTO TREINADOR
   VALUES
   ('julho@tapago.com', '111.111.111-11', 'Julho Balestrini', '1944-07-05', '$2b$10$ayiZSiCMWstXLF4VyKzkr.EoEmh1NE/pfiGYsarso9yYlPZ9.m70e', 100000), --senha: 123456
   ('amanda@tapago.com', '222.222.222-22', 'Amanda Nunes', NULL, '$2b$10$PjxuY/ScFeq1yiZm5BCz.eDt0W67gm9FVc8zPYD8.ytODH4nwoCjy', 90000),
   ('carlos@tapago.com', '333.333.333-33', 'Carlos Almeida', '1980-03-02', '$2b$10$mGXKbxiMvYyrJzG4EGsOru7MjtbHSALr453VBOu0mvRQaSZI7lJbC', 80000),
   ('felipe@tapago.com', '444.444.444-44', 'Felipe Rodrigues', '1975-09-12', '$2b$10$9V94F1Mq0lEwASWujNZy/eDKUwvTw1G7MfE8R7xhSh39gRG2ayxM2', 110000),
   ('viviane@tapago.com', '555.555.555-55', 'Viviane Oliveira', '1982-04-08', '$2b$10$1eq89ZIsMQyFcmYjUHdsbeFhKYr0dtstl8dfwUowBrrxUfJL62jcy', 120000),
   ('rafael@tapago.com', '666.666.666-66', 'Rafaela Silva', '1990-07-22', '$2b$10$CBE1DC2VSP9M5DTF6PP4OO1a4NhIAioSkmVtj.hzVGSQ2.j5XVrvC', 100000);
  
DROP TABLE IF EXISTS EQUIPAMENTO CASCADE;

CREATE TABLE EQUIPAMENTO (
	id				UUID DEFAULT uuid_generate_v4 ()	NOT NULL,
	nome 			VARCHAR(30)							NOT NULL,
	email_treinador VARCHAR(30)							UNIQUE,
	PRIMARY KEY (id),
	FOREIGN KEY (email_treinador) REFERENCES TREINADOR (email)
		ON UPDATE CASCADE
		ON DELETE SET NULL
);

INSERT INTO EQUIPAMENTO
VALUES
  ('1a227ae0-a190-11ee-8c90-0242ac120002', 'Halteres', 'julho@tapago.com'),
  ('1a227ae0-a190-11ee-8c90-0242ac120003', 'Leg Press', 'amanda@tapago.com'),
  ('1a227ae0-a190-11ee-8c90-0242ac120004', 'Supino', 'carlos@tapago.com'),
  ('1a227ae0-a190-11ee-8c90-0242ac120005', 'Cadeira Flexora', 'felipe@tapago.com'),
  ('1a227ae0-a190-11ee-8c90-0242ac120006', 'Cross Over', 'viviane@tapago.com'),
  ('1a227ae0-a190-11ee-8c90-0242ac120007', 'Smith', 'rafael@tapago.com');

DROP TABLE IF EXISTS USA CASCADE;

CREATE TABLE USA (
	data 			DATE		NOT NULL,
	email_cliente	VARCHAR(30)	NOT NULL,
	id_equip		UUID		NOT NULL,
	peso			INTEGER		NOT NULL,
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
   ('2023-01-15', 'maria@gmail.com', '1a227ae0-a190-11ee-8c90-0242ac120004', 50, 15),
   ('2023-01-20', 'ana@gmail.com', '1a227ae0-a190-11ee-8c90-0242ac120005', 70, 10),
   ('2023-01-22', 'roberto@gmail.com', '1a227ae0-a190-11ee-8c90-0242ac120006', 90, 8),
   ('2023-01-25', 'carolina@gmail.com', '1a227ae0-a190-11ee-8c90-0242ac120007', 60, 12),
   ('2023-01-28', 'ana@gmail.com', '1a227ae0-a190-11ee-8c90-0242ac120006', 85, 10),
   ('2023-01-30', 'roberto@gmail.com', '1a227ae0-a190-11ee-8c90-0242ac120007', 55, 15),
   ('2023-02-02', 'carolina@gmail.com', '1a227ae0-a190-11ee-8c90-0242ac120005', 75, 12);
  