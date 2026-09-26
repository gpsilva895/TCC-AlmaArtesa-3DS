<?php
/**
 * Alma Artesã — Conexão com o banco de dados (PDO / MySQL)
 *
 * Cenário padrão: só o MySQL/MariaDB roda no XAMPP; a API PHP roda fora
 * dele (servidor embutido do PHP: `php -S`), então a conexão é sempre por
 * TCP em 127.0.0.1:3306 — evita problemas de "localhost" tentando um
 * socket Unix que só existe dentro do próprio XAMPP.
 *
 * As credenciais vêm de variáveis de ambiente, com valores padrão iguais
 * aos do XAMPP (usuário `root`, sem senha, porta 3306). Se o seu MySQL do
 * XAMPP usa outra porta/senha, ajuste via variável de ambiente ou troque
 * os valores padrão abaixo.
 */
class Database
{
    private string $host;
    private string $port;
    private string $db_name;
    private string $username;
    private string $password;
    public ?PDO $conn = null;

    public function __construct()
    {
        $this->host     = getenv('DB_HOST') ?: '127.0.0.1';
        $this->port     = getenv('DB_PORT') ?: '3306';
        $this->db_name  = getenv('DB_NAME') ?: 'alma_artesa';
        $this->username = getenv('DB_USER') ?: 'root';
        $this->password = getenv('DB_PASS') ?: '';
    }

    public function getConnection(): PDO
    {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host={$this->host};port={$this->port};dbname={$this->db_name};charset=utf8mb4",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            http_response_code(500);
            // Em produção, esconda $e->getMessage(); em desenvolvimento local
            // ajuda a ver na hora se é senha errada, banco não criado, XAMPP
            // desligado, etc.
            echo json_encode([
                'erro'   => 'Falha na conexão com o banco de dados.',
                'detalhe' => $e->getMessage(),
            ]);
            exit;
        }
        return $this->conn;
    }
}
