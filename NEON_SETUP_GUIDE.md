# Guia de Configuração do Neon.tech para o Projeto REC

Este guia explica como configurar e usar o Neon.tech como banco de dados PostgreSQL serverless para o projeto REC, substituindo o SQLite atual.

## 1. Criar uma Conta no Neon.tech

1. Acesse [neon.tech](https://neon.tech) e crie uma conta (você pode usar GitHub, Google ou email).
2. Após o login, clique em "Create a project".
3. Dê um nome ao projeto (ex: "rec-project") e selecione a região mais próxima de você.
4. Clique em "Create Project".

## 2. Obter a String de Conexão

1. No dashboard do projeto, clique no botão "Connect".
2. Selecione "Connect with psql, pgAdmin, etc.".
3. Copie a string de conexão fornecida. Ela deve ser semelhante a:
   ```
   postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```

## 3. Configurar o Ambiente Local

1. Abra o arquivo `.env` na raiz do projeto.
2. Substitua o valor da variável `DATABASE_URL` pela string de conexão copiada:
   ```
   DATABASE_URL=postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```

## 4. Instalar Dependências

Certifique-se de que todas as dependências necessárias estão instaladas:

```bash
pip install -r requirements.txt
```

## 5. Inicializar o Sistema de Migração

Execute os seguintes comandos para inicializar o sistema de migração do Flask-Migrate:

```bash
flask db init
flask db migrate -m "Migração inicial"
flask db upgrade
```

## 6. Migrar Dados do SQLite para o Neon.tech

Se você já tem dados no banco SQLite e deseja migrá-los para o Neon.tech, use o script de migração fornecido:

```bash
python migrate_to_neon.py
```

Siga as instruções na tela para completar a migração.

## 7. Verificar a Configuração

Para verificar se a configuração está correta, você pode usar os scripts de teste fornecidos:

```bash
# Testar apenas a conexão com o banco de dados Neon.tech
python test_neon_connection.py

# Testar a aplicação completa com o banco de dados Neon.tech
python test_app_with_neon.py
```

Em seguida, inicie a aplicação para verificar se tudo está funcionando corretamente:

```bash
python src/main.py
```

A aplicação deve iniciar e conectar-se ao banco de dados Neon.tech.

## 8. Solução de Problemas

### Erro de Conexão

Se você encontrar erros de conexão, verifique:

1. Se a string de conexão está correta no arquivo `.env`.
2. Se o IP do seu computador está na lista de IPs permitidos no Neon.tech (se aplicável).
3. Se o firewall não está bloqueando a conexão.

### Erro de SSL

Se você encontrar erros relacionados a SSL, certifique-se de que a string de conexão inclui `?sslmode=require`.

## 9. Recursos Adicionais

- [Documentação do Neon.tech](https://neon.tech/docs)
- [Documentação do Flask-SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/)
- [Documentação do Flask-Migrate](https://flask-migrate.readthedocs.io/)

## 10. Benefícios do Neon.tech

- **Serverless**: Escala automaticamente conforme necessário.
- **Branching**: Crie cópias isoladas do banco de dados para desenvolvimento e testes.
- **Compatibilidade PostgreSQL**: Totalmente compatível com PostgreSQL.
- **Escalabilidade**: Suporta crescimento sem necessidade de gerenciamento de infraestrutura.
- **Custo-efetivo**: Pague apenas pelo que usar, com um generoso plano gratuito.