<?php
/**
 * Alma Artesã — API de Carrinho
 * GET    /api/carrinho.php?id_usuario=1
 * POST   /api/carrinho.php   { id_usuario, id_produto, quantidade }
 * PUT    /api/carrinho.php?id_item=1   { quantidade }
 * DELETE /api/carrinho.php?id_item=1
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

function getOrCreateCarrinho(PDO $db, int $idUsuario): int
{
    $stmt = $db->prepare("SELECT id_carrinho FROM carrinho WHERE id_usuario = :id AND status = 'aberto'");
    $stmt->execute(['id' => $idUsuario]);
    $carrinho = $stmt->fetch();
    if ($carrinho) {
        return (int) $carrinho['id_carrinho'];
    }
    $stmt = $db->prepare("INSERT INTO carrinho (id_usuario) VALUES (:id)");
    $stmt->execute(['id' => $idUsuario]);
    return (int) $db->lastInsertId();
}

switch ($method) {
    case 'GET':
        $idUsuario = (int) ($_GET['id_usuario'] ?? 0);
        $stmt = $db->prepare(
            "SELECT ic.id_item_carrinho, ic.id_produto, ic.quantidade, ic.preco_unitario, ic.subtotal,
                    p.nome, p.imagem, a.nome_loja
             FROM carrinho c
             JOIN item_carrinho ic ON ic.id_carrinho = c.id_carrinho
             JOIN produto p ON p.id_produto = ic.id_produto
             JOIN artesao a ON a.id_artesao = p.id_artesao
             WHERE c.id_usuario = :id_usuario AND c.status = 'aberto'"
        );
        $stmt->execute(['id_usuario' => $idUsuario]);
        $itens = $stmt->fetchAll();
        $total = array_sum(array_column($itens, 'subtotal'));
        echo json_encode(['itens' => $itens, 'total' => $total]);
        break;

    case 'POST':
        $dados = json_decode(file_get_contents('php://input'), true);

        $stmtProduto = $db->prepare(
            "SELECT p.preco, a.id_usuario AS artesao_usuario_id
             FROM produto p JOIN artesao a ON a.id_artesao = p.id_artesao
             WHERE p.id_produto = :id"
        );
        $stmtProduto->execute(['id' => $dados['id_produto']]);
        $produto = $stmtProduto->fetch();
        if (!$produto) {
            http_response_code(404);
            echo json_encode(['erro' => 'Produto não encontrado.']);
            break;
        }
        // Um artesão não pode comprar (nem colocar no carrinho) o próprio produto.
        if ((int) $produto['artesao_usuario_id'] === (int) $dados['id_usuario']) {
            http_response_code(403);
            echo json_encode(['erro' => 'Você não pode adicionar seu próprio produto ao carrinho.']);
            break;
        }

        $idCarrinho = getOrCreateCarrinho($db, (int) $dados['id_usuario']);

        $stmt = $db->prepare(
            "SELECT id_item_carrinho, quantidade FROM item_carrinho
             WHERE id_carrinho = :id_carrinho AND id_produto = :id_produto"
        );
        $stmt->execute(['id_carrinho' => $idCarrinho, 'id_produto' => $dados['id_produto']]);
        $itemExistente = $stmt->fetch();

        $quantidade = (int) ($dados['quantidade'] ?? 1);

        if ($itemExistente) {
            $db->prepare("UPDATE item_carrinho SET quantidade = quantidade + :q WHERE id_item_carrinho = :id")
               ->execute(['q' => $quantidade, 'id' => $itemExistente['id_item_carrinho']]);
        } else {
            $db->prepare(
                "INSERT INTO item_carrinho (id_carrinho, id_produto, quantidade, preco_unitario)
                 VALUES (:id_carrinho, :id_produto, :quantidade, :preco)"
            )->execute([
                'id_carrinho' => $idCarrinho,
                'id_produto'  => $dados['id_produto'],
                'quantidade'  => $quantidade,
                'preco'       => $produto['preco'],
            ]);
        }
        http_response_code(201);
        echo json_encode(['mensagem' => 'Item adicionado ao carrinho.']);
        break;

    case 'PUT':
        $dados = json_decode(file_get_contents('php://input'), true);
        $quantidade = max(1, (int) ($dados['quantidade'] ?? 1));
        $db->prepare("UPDATE item_carrinho SET quantidade = :q WHERE id_item_carrinho = :id")
           ->execute(['q' => $quantidade, 'id' => $_GET['id_item']]);
        echo json_encode(['mensagem' => 'Quantidade atualizada.']);
        break;

    case 'DELETE':
        $db->prepare("DELETE FROM item_carrinho WHERE id_item_carrinho = :id")
           ->execute(['id' => $_GET['id_item']]);
        echo json_encode(['mensagem' => 'Item removido do carrinho.']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['erro' => 'Método não permitido.']);
}
