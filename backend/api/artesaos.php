<?php
/**
 * Alma Artesã — API de Artesãos
 * GET /api/artesaos.php?id=1            -> perfil de um artesão (loja + biografia)
 * GET /api/artesaos.php?id_usuario=1    -> perfil de artesão a partir do id do usuário (área logada)
 * GET /api/artesaos.php                 -> lista de artesãos ativos
 * PUT /api/artesaos.php?id_usuario=1    -> atualiza dados da loja (nome_loja, biografia, foto_perfil, chave_pix)
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET' && isset($_GET['id_usuario'])) {
    $stmt = $db->prepare(
        "SELECT id_artesao, id_usuario, nome_loja, biografia, foto_perfil, chave_pix, status
         FROM artesao WHERE id_usuario = :id_usuario"
    );
    $stmt->execute(['id_usuario' => $_GET['id_usuario']]);
    $artesao = $stmt->fetch();
    if (!$artesao) {
        http_response_code(404);
        echo json_encode(['erro' => 'Perfil de artesão não encontrado.']);
        exit;
    }
    echo json_encode($artesao);
    exit;
}

if ($method === 'GET' && isset($_GET['id'])) {
    $stmt = $db->prepare(
        "SELECT id_artesao, nome_loja, biografia, foto_perfil, status
         FROM artesao WHERE id_artesao = :id"
    );
    $stmt->execute(['id' => $_GET['id']]);
    $artesao = $stmt->fetch();
    if (!$artesao) {
        http_response_code(404);
        echo json_encode(['erro' => 'Artesão não encontrado.']);
        exit;
    }
    echo json_encode($artesao);
    exit;
}

if ($method === 'PUT' && isset($_GET['id_usuario'])) {
    $dados = json_decode(file_get_contents('php://input'), true);
    if (isset($dados['nome_loja']) && trim($dados['nome_loja']) === '') {
        http_response_code(400);
        echo json_encode(['erro' => 'O nome da loja não pode ficar vazio.']);
        exit;
    }
    $campos = [];
    $params = ['id_usuario' => $_GET['id_usuario']];
    foreach (['nome_loja', 'biografia', 'foto_perfil', 'chave_pix'] as $campo) {
        if (isset($dados[$campo])) {
            $campos[] = "$campo = :$campo";
            $params[$campo] = $dados[$campo];
        }
    }
    if (empty($campos)) {
        http_response_code(400);
        echo json_encode(['erro' => 'Nenhum campo para atualizar.']);
        exit;
    }
    $sql = "UPDATE artesao SET " . implode(', ', $campos) . " WHERE id_usuario = :id_usuario";
    $db->prepare($sql)->execute($params);
    echo json_encode(['mensagem' => 'Perfil de artesão atualizado com sucesso.']);
    exit;
}

if ($method === 'GET') {
    $stmt = $db->query(
        "SELECT id_artesao, nome_loja, biografia, foto_perfil
         FROM artesao WHERE status = 'ativo' ORDER BY nome_loja"
    );
    echo json_encode($stmt->fetchAll());
    exit;
}

http_response_code(405);
echo json_encode(['erro' => 'Requisição inválida.']);
