FROM php:8.2-cli

# Extensão PDO MySQL, necessária para a conexão com o banco (config/database.php)
RUN docker-php-ext-install pdo pdo_mysql

WORKDIR /app
COPY . /app

EXPOSE 8000
CMD ["php", "-S", "0.0.0.0:8000"]
