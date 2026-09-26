<?php
/**
 * Alma Artesã — API de Produtos
 * GET    /api/produtos.php               -> lista (filtros: categoria, busca, artesao)
 * GET    /api/produtos.php?id=1          -> detalhe de um produto
 * POST   /api/produtos.php               -> cria produto (artesão)
 * PUT    /api/produtos.php?id=1          -> atualiza produto
 * DELETE /api/produtos.php?id=1          -> remove produto
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $db->prepare(
                "SELECT p.*, a.nome_loja, a.id_usuario AS artesao_usuario_id, a.foto_perfil AS artesao_foto,
                        c.nome AS categoria_nome,
                        ROUND(AVG(av.nota), 1) AS media_avaliacao, COUNT(av.id_avaliacao) AS total_avaliacoes
                 FROM produto p
                 JOIN artesao a ON a.id_artesao = p.id_artesao
                 JOIN categoria c ON c.id_categoria = p.id_categoria
                 LEFT JOIN avaliacao av ON av.id_produto = p.id_produto
                 WHERE p.id_produto = :id
                 GROUP BY p.id_produto"
            );
            $stmt->execute(['id' => $_GET['id']]);
            $produto = $stmt->fetch();
            if (!$produto) {
                http_response_code(404);
                echo json_encode(['erro' => 'Produto não encontrado.']);
                break;
            }
            echo json_encode($produto);
            break;
        }

        $sql = "SELECT p.id_produto, p.nome, p.preco, p.imagem, p.estoque, a.nome_loja, a.id_usuario AS artesao_usuario_id
                FROM produto p
                JOIN artesao a ON a.id_artesao = p.id_artesao
                WHERE p.status = 'ativo'";
        $params = [];

        if (!empty($_GET['categoria'])) {
            $sql .= " AND p.id_categoria = :categoria";
            $params['categoria'] = $_GET['categoria'];
        }
        if (!empty($_GET['artesao'])) {
            $sql .= " AND p.id_artesao = :artesao";
            $params['artesao'] = $_GET['artesao'];
        }
        if (!empty($_GET['busca'])) {
            $sql .= " AND (p.nome LIKE :busca OR p.descricao LIKE :busca)";
            $params['busca'] = '%' . $_GET['busca'] . '%';
        }
        $sql .= " ORDER BY p.data_cadastro DESC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        $dados = json_decode(file_get_contents('php://input'), true);

        foreach (['id_artesao', 'id_categoria', 'nome', 'preco'] as $campo) {
            if (empty($dados[$campo]) && $dados[$campo] !== '0') {
                http_response_code(400);
                echo json_encode(['erro' => "Campo obrigatório ausente: $campo"]);
                exit;
            }
        }
        if (!is_numeric($dados['preco']) || (float) $dados['preco'] <= 0) {
            http_response_code(400);
            echo json_encode(['erro' => 'Preço inválido.']);
            exit;
        }
        if (isset($dados['estoque']) && (!is_numeric($dados['estoque']) || (int) $dados['estoque'] < 0)) {
            http_response_code(400);
            echo json_encode(['erro' => 'Estoque inválido.']);
            exit;
        }

        $stmt = $db->prepare(
            "INSERT INTO produto (id_artesao, id_categoria, nome, descricao, preco, imagem, estoque)
             VALUES (:id_artesao, :id_categoria, :nome, :descricao, :preco, :imagem, :estoque)"
        );
        $stmt->execute([
            'id_artesao'   => $dados['id_artesao'],
            'id_categoria' => $dados['id_categoria'],
            'nome'         => $dados['nome'],
            'descricao'    => $dados['descricao'] ?? '',
            'preco'        => $dados['preco'],
            'imagem'       => $dados['imagem'] ?? null,
            'estoque'      => $dados['estoque'] ?? 0,
        ]);
        http_response_code(201);
        echo json_encode(['id_produto' => $db->lastInsertId()]);
        break;

    case 'PUT':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID do produto não informado.']);
            break;
        }
        $dados = json_decode(file_get_contents('php://input'), true);
        if (isset($dados['preco']) && (!is_numeric($dados['preco']) || (float) $dados['preco'] <= 0)) {
            http_response_code(400);
            echo json_encode(['erro' => 'Preço inválido.']);
            break;
        }
        if (isset($dados['estoque']) && (!is_numeric($dados['estoque']) || (int) $dados['estoque'] < 0)) {
            http_response_code(400);
            echo json_encode(['erro' => 'Estoque inválido.']);
            break;
        }
        if (isset($dados['nome']) && trim($dados['nome']) === '') {
            http_response_code(400);
            echo json_encode(['erro' => 'Nome do produto não pode ser vazio.']);
            break;
        }
        $campos = [];
        $params = ['id' => $_GET['id']];
        foreach (['nome', 'descricao', 'preco', 'imagem', 'estoque', 'id_categoria', 'status'] as $campo) {
            if (isset($dados[$campo])) {
                $campos[] = "$campo = :$campo";
                $params[$campo] = $dados[$campo];
            }
        }
        if (empty($campos)) {
            http_response_code(400);
            echo json_encode(['erro' => 'Nenhum campo para atualizar.']);
            break;
        }
        $sql = "UPDATE produto SET " . implode(', ', $campos) . " WHERE id_produto = :id";
        $db->prepare($sql)->execute($params);
        echo json_encode(['mensagem' => 'Produto atualizado com sucesso.']);
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID do produto não informado.']);
            break;
        }
        $stmt = $db->prepare("UPDATE produto SET status = 'inativo' WHERE id_produto = :id");
        $stmt->execute(['id' => $_GET['id']]);
        echo json_encode(['mensagem' => 'Produto removido com sucesso.']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['erro' => 'Método não permitido.']);
}
