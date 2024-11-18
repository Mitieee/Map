-- Criação do banco de dados, se não existir
CREATE DATABASE IF NOT EXISTS emergencias;
USE emergencias;

-- usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    telefone VARCHAR(15) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    data_nascimento DATE NOT NULL,
    tipo_sanguineo ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    peso DECIMAL(5,2) NOT NULL,
    altura DECIMAL(5,2) NOT NULL,
    alergia VARCHAR(255),
    outras_informacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);