# Sistema de Email Triggers

Este documento descreve o sistema de email triggers implementado no Vehicle Recovery System (VRS). O sistema permite receber emails automaticamente, extrair informações sobre veículos desaparecidos e criar registros no sistema.

## Funcionalidades

1. **Recebimento automático de emails**: O sistema verifica periodicamente uma caixa de email configurada para novos emails.
2. **Extração de dados**: Extrai automaticamente informações como matrícula, marca, modelo, VIN, data de desaparecimento, etc.
3. **Criação de veículos**: Cria automaticamente registros de veículos no sistema com base nos dados extraídos.
4. **Interface de gestão**: Interface web para visualizar, processar e gerenciar emails recebidos.

## Configuração

### 1. Configurar credenciais de email

Execute o script de configuração para definir as credenciais de email:

```bash
python setup_email_config.py
```

Este script irá solicitar:
- Endereço de email
- Senha
- Servidor IMAP (padrão: imap.gmail.com)
- Porta IMAP (padrão: 993)

### 2. Configurar o agendador de verificação

Para verificar emails periodicamente, você pode executar o script de agendamento:

```bash
python schedule_email_check.py
```

Por padrão, o sistema verifica novos emails a cada 15 minutos. Você pode alterar este intervalo definindo a variável de ambiente `CHECK_INTERVAL_MINUTES`.

## Formato de Email

Para que o sistema extraia corretamente as informações, os emails devem seguir um formato específico. O sistema procura por padrões como:

```
Matrícula: AA-00-00
Marca: Toyota
Modelo: Corolla
VIN: 1HGCM82633A123456
Data de desaparecimento: 01/01/2023
Nome do cliente: João Silva
Contacto: 912345678
Loja: Lisboa
```

O sistema é flexível e pode reconhecer variações neste formato, mas quanto mais padronizado for o email, melhor será a extração de dados.

## Interface Web

A interface web para gerenciar email triggers está disponível em:

```
http://seu-servidor/email-triggers
```

Nesta interface, você pode:

1. **Verificar novos emails**: Buscar manualmente novos emails na caixa de entrada.
2. **Processar automaticamente**: Processar todos os emails não processados e criar veículos automaticamente.
3. **Processar individualmente**: Processar um email específico manualmente.
4. **Visualizar detalhes**: Ver informações detalhadas sobre cada email recebido.

## Solução de Problemas

### Problemas com Gmail

Se estiver usando Gmail, você precisará:

1. Habilitar o acesso a apps menos seguros: https://myaccount.google.com/lesssecureapps
2. Ou criar uma senha de app específica: https://support.google.com/accounts/answer/185833

### Logs

O sistema mantém logs detalhados em `email_scheduler.log`. Consulte este arquivo para diagnosticar problemas com o agendador de verificação de emails.

## Extensões Futuras

1. **Suporte a anexos**: Implementar processamento de anexos como fotos do veículo ou documentos.
2. **Notificações**: Enviar notificações quando novos emails forem processados.
3. **Análise avançada**: Implementar análise de texto mais sofisticada para extrair informações adicionais.
4. **Integração com outros serviços de email**: Adicionar suporte para outros provedores além do IMAP.