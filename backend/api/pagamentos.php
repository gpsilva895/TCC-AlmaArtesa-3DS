<?php
/**
 * Alma Artesã — API de Pagamento
 * GET /api/pagamentos.php?id_pedido=1
 *   -> Dados do pagamento (forma, status, valor) + status/valor do pedido.
 * PUT /api/pagamentos.php?id_pedido=1   { id_usuario, forma_pagamento }
 *   -> Confirma/"processa" o pagamento (simulado: aprova na hora) e marca
 *      o pedido como 'pago'. Exige id_usuario para garantir que só o dono
 *      do pedido pode pagá-lo.
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (!isset($_GET['id_pedido'])) {
        http_response_code(400);
        echo json_encode(['erro' => 'Pedido não informado.']);
        exit;
    }
    $stmt = $db->prepare(
        "SELECT pg.id_pagamento, pg.forma_pagamento, pg.status_pagamento, pg.valor,
                pg.data_pagamento, pg.codigo_transacao,
                pe.id_pedido, pe.id_usuario, pe.status AS status_pedido, pe.valor_total
         FROM pagamento pg
         JOIN pedido pe ON pe.id_pedido = pg.id_pedido
         WHERE pg.id_pedido = :id_pedido"
    );
    $stmt->execute(['id_pedido' => $_GET['id_pedido']]);
    $pagamento = $stmt->fetch();
    if (!$pagamento) {
        http_response_code(404);
        echo json_encode(['erro' => 'Pagamento não encontrado para este pedido.']);
        exit;
    }
    echo json_encode($pagamento);
    exit;
}

if ($method === 'PUT') {
    if (!isset($_GET['id_pedido'])) {
        http_response_code(400);
        echo json_encode(['erro' => 'Pedido não informado.']);
        exit;
    }
    $idPedido = (int) $_GET['id_pedido'];
    $dados = json_decode(file_get_contents('php://input'), true);
    $idUsuario = (int) ($dados['id_usuario'] ?? 0);
    $formaPagamento = $dados['forma_pagamento'] ?? null;

    $stmt = $db->prepare("SELECT id_usuario, status FROM pedido WHERE id_pedido = :id");
    $stmt->execute(['id' => $idPedido]);
    $pedido = $stmt->fetch();

    if (!$pedido) {
        http_response_code(404);
        echo json_encode(['erro' => 'Pedido não encontrado.']);
        exit;
    }
    if (!$idUsuario || (int) $pedido['id_usuario'] !== $idUsuario) {
        http_response_code(403);
        echo json_encode(['erro' => 'Este pedido não pertence a este usuário.']);
        exit;
    }
    if ($pedido['status'] !== 'aguardando_pagamento') {
        http_response_code(400);
        echo json_encode(['erro' => 'Este pedido não está mais aguardando pagamento.']);
        exit;
    }

    try {
        $db->beginTransaction();

        // Pagamento simulado: aprova na hora e gera um código de transação fake.
        $codigoTransacao = strtoupper(uniqid('TXN'));
        $paramsPagamento = [
            'status_pagamento' => 'aprovado',
            'codigo_transacao' => $codigoTransacao,
            'id_pedido'        => $idPedido,
        ];
        $sqlPagamento = "UPDATE pagamento SET status_pagamento = :status_pagamento,
                                data_pagamento = NOW(), codigo_transacao = :codigo_transacao";
        if ($formaPagamento) {
            $sqlPagamento .= ", forma_pagamento = :forma_pagamento";
            $paramsPagamento['forma_pagamento'] = $formaPagamento;
        }
        $sqlPagamento .= " WHERE id_pedido = :id_pedido";
        $db->prepare($sqlPagamento)->execute($paramsPagamento);

        $db->prepare("UPDATE pedido SET status = 'pago' WHERE id_pedido = :id")
            ->execute(['id' => $idPedido]);

        $db->prepare(
            "INSERT INTO notificacao (id_usuario, titulo, mensagem, tipo)
             VALUES (:id_usuario, 'Pagamento aprovado', :mensagem, 'pedido')"
        )->execute([
            'id_usuario' => $idUsuario,
            'mensagem'   => "O pagamento do pedido #$idPedido foi aprovado.",
        ]);

        $db->commit();
        echo json_encode(['mensagem' => 'Pagamento aprovado com sucesso.', 'codigo_transacao' => $codigoTransacao]);
    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(['erro' => 'Não foi possível processar o pagamento.']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['erro' => 'Método não permitido.']);
