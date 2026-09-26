<?php
/**
 * Alma Artesã — API de Avaliações (comentários + nota de produtos)
 * GET  /api/avaliacoes.php?id_produto=1[&id_usuario=2]
 *   -> Lista as avaliações do produto (mais recentes primeiro) e, se
 *      id_usuario for informado, também diz se esse usuário pode avaliar
 *      (comprou o produto) e se já avaliou.
 * POST /api/avaliacoes.php   { id_usuario, id_produto, nota, comentario? }
 *   -> Só permite avaliar quem tem pelo menos um pedido não cancelado
 *      contendo o produto, e que ainda não avaliou (a tabela também tem
 *      uma UNIQUE (id_usuario, id_produto) como segunda barreira).
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Verifica se o usuário tem ao menos um pedido (não cancelado) com esse produto.
function usuarioComprouProduto(PDO $db, int $idUsuario, int $idProduto): bool
{
    $stmt = $db->prepare(
        "SELECT 1
         FROM item_pedido ip
         JOIN pedido pe ON pe.id_pedido = ip.id_pedido
         WHERE pe.id_usuario = :id_usuario
           AND ip.id_produto = :id_produto
           AND pe.status != 'cancelado'
         LIMIT 1"
    );
    $stmt->execute(['id_usuario' => $idUsuario, 'id_produto' => $idProduto]);
    return (bool) $stmt->fetchColumn();
}

if ($method === 'GET') {
    if (!isset($_GET['id_produto'])) {
        http_response_code(400);
        echo json_encode(['erro' => 'Produto não informado.']);
        exit;
    }
    $idProduto = (int) $_GET['id_produto'];

    $stmt = $db->prepare(
        "SELECT av.id_avaliacao, av.id_usuario, av.nota, av.comentario, av.data_avaliacao,
                u.nome AS nome_usuario, u.foto_perfil AS foto_usuario
         FROM avaliacao av
         JOIN usuario u ON u.id_usuario = av.id_usuario
         WHERE av.id_produto = :id_produto
         ORDER BY av.data_avaliacao DESC"
    );
    $stmt->execute(['id_produto' => $idProduto]);
    $avaliacoes = $stmt->fetchAll();

    $podeAvaliar = false;
    $jaAvaliou = false;
    if (!empty($_GET['id_usuario'])) {
        $idUsuario = (int) $_GET['id_usuario'];
        $jaAvaliou = in_array($idUsuario, array_column($avaliacoes, 'id_usuario'));
        $podeAvaliar = !$jaAvaliou && usuarioComprouProduto($db, $idUsuario, $idProduto);
    }

    echo json_encode([
        'avaliacoes'   => $avaliacoes,
        'pode_avaliar' => $podeAvaliar,
        'ja_avaliou'   => $jaAvaliou,
    ]);
    exit;
}

if ($method === 'POST') {
    $dados = json_decode(file_get_contents('php://input'), true);
    $idUsuario = (int) ($dados['id_usuario'] ?? 0);
    $idProduto = (int) ($dados['id_produto'] ?? 0);
    $nota = (int) ($dados['nota'] ?? 0);
    $comentario = trim($dados['comentario'] ?? '');

    if (!$idUsuario || !$idProduto) {
        http_response_code(400);
        echo json_encode(['erro' => 'Usuário ou produto não informado.']);
        exit;
    }
    if ($nota < 1 || $nota > 5) {
        http_response_code(400);
        echo json_encode(['erro' => 'Informe uma nota de 1 a 5.']);
        exit;
    }
    if (!usuarioComprouProduto($db, $idUsuario, $idProduto)) {
        http_response_code(403);
        echo json_encode(['erro' => 'Só é possível avaliar produtos que você já comprou.']);
        exit;
    }

    try {
        $stmt = $db->prepare(
            "INSERT INTO avaliacao (id_usuario, id_produto, nota, comentario)
             VALUES (:id_usuario, :id_produto, :nota, :comentario)"
        );
        $stmt->execute([
            'id_usuario'  => $idUsuario,
            'id_produto'  => $idProduto,
            'nota'        => $nota,
            'comentario'  => $comentario !== '' ? $comentario : null,
        ]);
        http_response_code(201);
        echo json_encode(['id_avaliacao' => $db->lastInsertId()]);
    } catch (PDOException $e) {
        // Bate na UNIQUE (id_usuario, id_produto): usuário já avaliou este produto.
        if ($e->getCode() === '23000') {
            http_response_code(409);
            echo json_encode(['erro' => 'Você já avaliou este produto.']);
            exit;
        }
        http_response_code(500);
        echo json_encode(['erro' => 'Não foi possível salvar sua avaliação.']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['erro' => 'Método não permitido.']);