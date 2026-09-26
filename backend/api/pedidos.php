<?php
/**
 * Alma Artesã — API de Pedidos (Checkout)
 * POST /api/pedidos.php   { id_usuario, itens: [{id_produto, quantidade}], id_endereco?, frete?, forma_pagamento? }
 *   -> O carrinho do Alma Artesã é mantido no front-end (localStorage) até o
 *      checkout; por isso o pedido é montado a partir dos itens enviados no
 *      corpo da requisição, e não de uma tabela `carrinho` já populada.
 *      Preço e estoque de cada item são revalidados no banco (nunca se confia
 *      no preço enviado pelo cliente). Se `id_endereco` não for enviado, usa
 *      o endereço principal já salvo no Perfil do usuário.
 * GET  /api/pedidos.php?id_usuario=1
 * GET  /api/pedidos.php?id=1
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $dados = json_decode(file_get_contents('php://input'), true);
    $idUsuario = (int) ($dados['id_usuario'] ?? 0);
    $itensRecebidos = $dados['itens'] ?? [];
    $frete = (float) ($dados['frete'] ?? 0);

    if (!$idUsuario) {
        http_response_code(400);
        echo json_encode(['erro' => 'Usuário não informado. Faça login antes de finalizar a compra.']);
        exit;
    }
    if (empty($itensRecebidos)) {
        http_response_code(400);
        echo json_encode(['erro' => 'Carrinho vazio.']);
        exit;
    }

    try {
        $db->beginTransaction();

        // Resolve o endereço de entrega: o informado, ou o principal do perfil.
        $idEndereco = $dados['id_endereco'] ?? null;
        if (!$idEndereco) {
            $stmt = $db->prepare("SELECT id_endereco FROM endereco WHERE id_usuario = :id AND principal = 1 LIMIT 1");
            $stmt->execute(['id' => $idUsuario]);
            $endereco = $stmt->fetch();
            if (!$endereco) {
                throw new Exception('Cadastre um endereço de entrega no seu Perfil antes de finalizar a compra.');
            }
            $idEndereco = $endereco['id_endereco'];
        }

        // Revalida preço e estoque reais de cada item direto no banco.
        $stmtProduto = $db->prepare(
            "SELECT id_produto, nome, preco, estoque FROM produto WHERE id_produto = :id AND status = 'ativo'"
        );
        $subtotal = 0;
        $itensValidados = [];
        foreach ($itensRecebidos as $item) {
            $stmtProduto->execute(['id' => $item['id_produto']]);
            $produto = $stmtProduto->fetch();
            if (!$produto) {
                throw new Exception('Produto indisponível (id ' . $item['id_produto'] . ').');
            }
            $quantidade = max(1, (int) $item['quantidade']);
            if ($produto['estoque'] < $quantidade) {
                throw new Exception('Estoque insuficiente para "' . $produto['nome'] . '".');
            }
            $subtotal += $produto['preco'] * $quantidade;
            $itensValidados[] = [
                'id_produto'     => $produto['id_produto'],
                'quantidade'     => $quantidade,
                'preco_unitario' => $produto['preco'],
            ];
        }
        $valorTotal = $subtotal + $frete;

        $stmtPedido = $db->prepare(
            "INSERT INTO pedido (id_usuario, id_endereco, subtotal, frete, valor_total)
             VALUES (:id_usuario, :id_endereco, :subtotal, :frete, :valor_total)"
        );
        $stmtPedido->execute([
            'id_usuario'  => $idUsuario,
            'id_endereco' => $idEndereco,
            'subtotal'    => $subtotal,
            'frete'       => $frete,
            'valor_total' => $valorTotal,
        ]);
        $idPedido = (int) $db->lastInsertId();

        $stmtItem = $db->prepare(
            "INSERT INTO item_pedido (id_pedido, id_produto, quantidade, preco_unitario)
             VALUES (:id_pedido, :id_produto, :quantidade, :preco_unitario)"
        );
        $stmtEstoque = $db->prepare(
            "UPDATE produto SET estoque = estoque - :quantidade WHERE id_produto = :id_produto"
        );
        foreach ($itensValidados as $item) {
            $stmtItem->execute([
                'id_pedido'      => $idPedido,
                'id_produto'     => $item['id_produto'],
                'quantidade'     => $item['quantidade'],
                'preco_unitario' => $item['preco_unitario'],
            ]);
            $stmtEstoque->execute([
                'quantidade' => $item['quantidade'],
                'id_produto' => $item['id_produto'],
            ]);
        }

        $db->prepare(
            "INSERT INTO pagamento (id_pedido, forma_pagamento, valor, status_pagamento)
             VALUES (:id_pedido, :forma_pagamento, :valor, 'pendente')"
        )->execute([
            'id_pedido'       => $idPedido,
            'forma_pagamento' => $dados['forma_pagamento'] ?? 'pix',
            'valor'           => $valorTotal,
        ]);

        $db->prepare(
            "INSERT INTO notificacao (id_usuario, titulo, mensagem, tipo)
             VALUES (:id_usuario, 'Pedido realizado', :mensagem, 'pedido')"
        )->execute([
            'id_usuario' => $idUsuario,
            'mensagem'   => "Seu pedido #$idPedido foi registrado e está aguardando pagamento.",
        ]);

        $db->commit();
        http_response_code(201);
        echo json_encode(['id_pedido' => $idPedido, 'valor_total' => $valorTotal]);
    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(400);
        echo json_encode(['erro' => $e->getMessage()]);
    }
    exit;
}

if ($method === 'GET' && isset($_GET['id'])) {
    $stmt = $db->prepare(
        "SELECT ip.*, p.nome, p.imagem FROM item_pedido ip
         JOIN produto p ON p.id_produto = ip.id_produto
         WHERE ip.id_pedido = :id"
    );
    $stmt->execute(['id' => $_GET['id']]);
    echo json_encode($stmt->fetchAll());
    exit;
}

if ($method === 'GET' && isset($_GET['id_usuario'])) {
    $stmt = $db->prepare(
        "SELECT * FROM pedido WHERE id_usuario = :id_usuario ORDER BY data_pedido DESC"
    );
    $stmt->execute(['id_usuario' => $_GET['id_usuario']]);
    echo json_encode($stmt->fetchAll());
    exit;
}

http_response_code(405);
echo json_encode(['erro' => 'Requisição inválida.']);
