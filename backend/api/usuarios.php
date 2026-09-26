<?php
/**
 * Alma Artesã — API de Usuários (Cadastro / Login / Perfil)
 * POST /api/usuarios.php?acao=cadastro
 * POST /api/usuarios.php?acao=login
 * GET  /api/usuarios.php?id=1
 * PUT  /api/usuarios.php?id=1
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST' && ($_GET['acao'] ?? '') === 'cadastro') {
    $dados = json_decode(file_get_contents('php://input'), true);

    foreach (['nome', 'email', 'senha'] as $campo) {
        if (empty($dados[$campo])) {
            http_response_code(400);
            echo json_encode(['erro' => "Campo obrigatório ausente: $campo"]);
            exit;
        }
    }

    if (!filter_var($dados['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['erro' => 'Informe um e-mail válido.']);
        exit;
    }
    if (strlen($dados['senha']) < 6) {
        http_response_code(400);
        echo json_encode(['erro' => 'A senha deve ter pelo menos 6 caracteres.']);
        exit;
    }
    if (!empty($dados['telefone']) && !preg_match('/^\(\d{2}\) \d{4,5}-\d{4}$/', $dados['telefone'])) {
        http_response_code(400);
        echo json_encode(['erro' => 'Informe um telefone válido, no formato (xx) xxxxx-xxxx.']);
        exit;
    }

    $stmt = $db->prepare("SELECT id_usuario FROM usuario WHERE email = :email");
    $stmt->execute(['email' => $dados['email']]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['erro' => 'E-mail já cadastrado.']);
        exit;
    }

    $ehArtesao = ($dados['tipo_usuario'] ?? 'cliente') === 'artesao';
    if ($ehArtesao && empty($dados['nome_loja'])) {
        http_response_code(400);
        echo json_encode(['erro' => 'Campo obrigatório ausente: nome_loja']);
        exit;
    }

    $senhaHash = password_hash($dados['senha'], PASSWORD_BCRYPT);
    $stmt = $db->prepare(
        "INSERT INTO usuario (nome, email, senha, telefone, tipo_usuario)
         VALUES (:nome, :email, :senha, :telefone, :tipo_usuario)"
    );
    $stmt->execute([
        'nome'         => $dados['nome'],
        'email'        => $dados['email'],
        'senha'        => $senhaHash,
        'telefone'     => $dados['telefone'] ?? null,
        'tipo_usuario' => $ehArtesao ? 'artesao' : 'cliente',
    ]);
    $idUsuario = $db->lastInsertId();

    // Se marcou a opção de vender, já cria o perfil de loja (tabela artesao).
    if ($ehArtesao) {
        $db->prepare(
            "INSERT INTO artesao (id_usuario, nome_loja, biografia, foto_perfil, chave_pix, status)
             VALUES (:id_usuario, :nome_loja, :biografia, :foto_perfil, :chave_pix, 'ativo')"
        )->execute([
            'id_usuario'  => $idUsuario,
            'nome_loja'   => $dados['nome_loja'],
            'biografia'   => $dados['biografia'] ?? null,
            'foto_perfil' => $dados['foto_perfil'] ?? null,
            'chave_pix'   => $dados['chave_pix'] ?? null,
        ]);
    }

    http_response_code(201);
    echo json_encode(['id_usuario' => $idUsuario, 'mensagem' => 'Cadastro realizado com sucesso.']);
    exit;
}

if ($method === 'POST' && ($_GET['acao'] ?? '') === 'login') {
    $dados = json_decode(file_get_contents('php://input'), true);

    $stmt = $db->prepare("SELECT * FROM usuario WHERE email = :email AND status = 'ativo'");
    $stmt->execute(['email' => $dados['email'] ?? '']);
    $usuario = $stmt->fetch();

    if (!$usuario || !password_verify($dados['senha'] ?? '', $usuario['senha'])) {
        http_response_code(401);
        echo json_encode(['erro' => 'E-mail ou senha inválidos.']);
        exit;
    }

    unset($usuario['senha']);
    // Em produção: gerar e retornar um JWT aqui.
    echo json_encode(['usuario' => $usuario]);
    exit;
}

if ($method === 'GET' && isset($_GET['id'])) {
    // LEFT JOIN com o endereço principal, para o formulário de Perfil vir pré-preenchido.
    $stmt = $db->prepare(
        "SELECT u.id_usuario, u.nome, u.email, u.telefone, u.cpf, u.tipo_usuario, u.foto_perfil, u.data_cadastro,
                e.id_endereco, e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.estado, e.cep, e.tipo_endereco
         FROM usuario u
         LEFT JOIN endereco e ON e.id_usuario = u.id_usuario AND e.principal = 1
         WHERE u.id_usuario = :id"
    );
    $stmt->execute(['id' => $_GET['id']]);
    $usuario = $stmt->fetch();
    if (!$usuario) {
        http_response_code(404);
        echo json_encode(['erro' => 'Usuário não encontrado.']);
        exit;
    }
    echo json_encode($usuario);
    exit;
}

if ($method === 'PUT' && isset($_GET['id'])) {
    $dados = json_decode(file_get_contents('php://input'), true);
    $idUsuario = (int) $_GET['id'];

    if (!empty($dados['telefone']) && !preg_match('/^\(\d{2}\) \d{4,5}-\d{4}$/', $dados['telefone'])) {
        http_response_code(400);
        echo json_encode(['erro' => 'Informe um telefone válido, no formato (xx) xxxxx-xxxx.']);
        exit;
    }
    if (!empty($dados['cep']) && !preg_match('/^\d{5}-\d{3}$/', $dados['cep'])) {
        http_response_code(400);
        echo json_encode(['erro' => 'Informe um CEP válido, no formato 00000-000.']);
        exit;
    }
    if (!empty($dados['estado']) && !preg_match('/^[A-Za-z]{2}$/', $dados['estado'])) {
        http_response_code(400);
        echo json_encode(['erro' => 'Informe a sigla do estado com 2 letras, ex.: SP.']);
        exit;
    }
    if (!empty($dados['senha']) && strlen($dados['senha']) < 6) {
        http_response_code(400);
        echo json_encode(['erro' => 'A senha deve ter pelo menos 6 caracteres.']);
        exit;
    }

    // --- Dados do usuário ---
    $campos = [];
    $params = ['id' => $idUsuario];
    foreach (['nome', 'telefone', 'cpf', 'foto_perfil'] as $campo) {
        if (isset($dados[$campo]) && $dados[$campo] !== '') {
            $campos[] = "$campo = :$campo";
            $params[$campo] = $dados[$campo];
        }
    }
    if (!empty($dados['senha'])) {
        $campos[] = "senha = :senha";
        $params['senha'] = password_hash($dados['senha'], PASSWORD_BCRYPT);
    }
    if (!empty($campos)) {
        $sql = "UPDATE usuario SET " . implode(', ', $campos) . " WHERE id_usuario = :id";
        $db->prepare($sql)->execute($params);
    }

    // --- Endereço principal (upsert) ---
    $camposEndereco = ['logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'cep'];
    $temEndereco = false;
    foreach ($camposEndereco as $c) {
        if (!empty($dados[$c])) {
            $temEndereco = true;
            break;
        }
    }
    if ($temEndereco) {
        $stmt = $db->prepare("SELECT id_endereco FROM endereco WHERE id_usuario = :id AND principal = 1 LIMIT 1");
        $stmt->execute(['id' => $idUsuario]);
        $enderecoExistente = $stmt->fetch();

        // A coluna é um ENUM fixo; qualquer texto livre digitado no campo
        // "Tipo de residência" que não bata com um desses valores cai em 'outro'.
        $tiposValidos = ['residencial', 'comercial', 'outro'];
        $tipoInformado = strtolower(trim($dados['tipo_residencia'] ?? ''));
        $tipoEndereco = in_array($tipoInformado, $tiposValidos, true) ? $tipoInformado : ($tipoInformado === '' ? 'residencial' : 'outro');

        $paramsEnd = [
            'logradouro'    => $dados['logradouro'] ?? '',
            'numero'        => $dados['numero'] ?? '',
            'complemento'   => $dados['complemento'] ?? null,
            'bairro'        => $dados['bairro'] ?? '',
            'cidade'        => $dados['cidade'] ?? 'São Paulo',
            'estado'        => $dados['estado'] ?? 'SP',
            'cep'           => $dados['cep'] ?? '',
            'tipo_endereco' => $tipoEndereco,
        ];

        if ($enderecoExistente) {
            $paramsEnd['id'] = $enderecoExistente['id_endereco'];
            $db->prepare(
                "UPDATE endereco SET logradouro = :logradouro, numero = :numero, complemento = :complemento,
                        bairro = :bairro, cidade = :cidade, estado = :estado, cep = :cep, tipo_endereco = :tipo_endereco
                 WHERE id_endereco = :id"
            )->execute($paramsEnd);
        } else {
            $paramsEnd['id_usuario'] = $idUsuario;
            $paramsEnd['principal'] = 1;
            $db->prepare(
                "INSERT INTO endereco (id_usuario, logradouro, numero, complemento, bairro, cidade, estado, cep, tipo_endereco, principal)
                 VALUES (:id_usuario, :logradouro, :numero, :complemento, :bairro, :cidade, :estado, :cep, :tipo_endereco, :principal)"
            )->execute($paramsEnd);
        }
    }

    echo json_encode(['mensagem' => 'Perfil atualizado com sucesso.']);
    exit;
}

http_response_code(405);
echo json_encode(['erro' => 'Requisição inválida.']);
