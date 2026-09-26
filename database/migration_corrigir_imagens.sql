-- =========================================================
-- Alma Artesã — Migração: corrigir colunas de imagem
-- =========================================================
-- Problema: foto_perfil (usuario e artesao) e imagem (produto) eram
-- VARCHAR(255), mas o front-end envia as fotos como base64 (data URLs),
-- que costumam ter milhares de caracteres. O MySQL truncava ou rejeitava
-- o valor, causando erro ao subir foto de produto e a foto de perfil
-- "sumindo" depois de recarregar a página.
--
-- Rode este script uma única vez no banco `alma_artesa` já existente.
-- (Quem for criar o banco do zero pode ignorar este arquivo: o
-- schema.sql já vem atualizado com LONGTEXT.)
-- =========================================================

USE alma_artesa;

ALTER TABLE usuario MODIFY COLUMN foto_perfil LONGTEXT;
ALTER TABLE artesao MODIFY COLUMN foto_perfil LONGTEXT;
ALTER TABLE produto MODIFY COLUMN imagem LONGTEXT;
