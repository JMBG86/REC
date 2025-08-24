# Sistema de Recuperação de Veículos

Sistema web completo para gestão de veículos desaparecidos de empresas de rent-a-car.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Sistema de Autenticação** - Login seguro com JWT
- **Gestão Completa de Veículos** - CRUD com todos os campos necessários
- **Dashboard Analítico** - Estatísticas e gráficos em tempo real
- **Perfil Detalhado de Veículos** - Timeline e gestão de documentos
- **Sistema de Utilizadores** - Gestão de acessos
- **Relatórios** - Interface para geração de relatórios
- **Design Responsivo** - Compatível com desktop, tablet e mobile

### 🔄 Em Desenvolvimento
- Sistema de email triggers automáticos
- Portal para rent-a-cars submeterem casos
- Análise de padrões e deteção de fraude
- Relatórios avançados em PDF

## 🛠️ Tecnologias

### Backend
- **Flask** - Framework web Python
- **SQLAlchemy** - ORM para base de dados
- **JWT** - Autenticação segura
- **PostgreSQL (Neon.tech)** - Base de dados serverless na nuvem
- **Flask-Migrate** - Sistema de migração de banco de dados
- **Flask-CORS** - Suporte para requisições cross-origin

### Frontend
- **React** - Framework JavaScript
- **Tailwind CSS** - Framework CSS
- **shadcn/ui** - Componentes UI modernos
- **Recharts** - Gráficos interativos
- **Lucide Icons** - Ícones modernos

## 📋 Campos do Formulário de Veículo

### Informações do Veículo
- Matrícula (obrigatório)
- Marca (obrigatório)
- Modelo (obrigatório)
- VIN
- Valor (€)
- Status (Em Tratamento, Submetido, Recuperado, Perdido)
- Data de Desaparecimento
- Loja de Aluguer
- Tem NUIPC (checkbox)
- Número NUIPC (aparece quando NUIPC ativo)
- Pedido de GPS Ativo
- Observações

### Informações do Cliente
- Nome do Cliente
- Contacto (telefone/telemóvel)
- Morada
- Email
- Observações sobre o Cliente

## 🚀 Como Executar

### Backend
```bash
cd vehicle-recovery-system
source venv/bin/activate  # No Windows: .\venv\Scripts\activate
pip install -r requirements.txt

# Configurar banco de dados Neon.tech (PostgreSQL)
# Veja instruções detalhadas em NEON_SETUP_GUIDE.md
python migrate_to_neon.py

# Iniciar a aplicação
python src/main.py
```

### Frontend
```bash
cd frontend
pnpm install
pnpm run dev
```

### Build para Produção
```bash
cd frontend
pnpm run build
cp -r dist/* ../src/static/
```

## 🌐 Deployment

A aplicação está configurada para deployment automático e está disponível em:
**https://j6h5i7cp7e7m.manus.space**

**Credenciais de teste:**
- Username: admin
- Password: admin123

## 🗄️ Banco de Dados

O sistema utiliza o **Neon.tech**, um serviço de PostgreSQL serverless na nuvem, oferecendo:

- **Alta disponibilidade** - Infraestrutura gerenciada e resiliente
- **Escalabilidade** - Escala automaticamente conforme a demanda
- **Branching** - Crie cópias isoladas do banco de dados para desenvolvimento e testes
- **Escala a Zero** - Economize recursos quando o banco de dados não está em uso
- **Compatibilidade PostgreSQL** - Aproveite todos os recursos do PostgreSQL

Para configurar o Neon.tech para este projeto, consulte o guia detalhado em [NEON_SETUP_GUIDE.md](NEON_SETUP_GUIDE.md).

## 📁 Estrutura do Projeto

```
vehicle-recovery-system/
├── src/                    # Backend Flask
│   ├── main.py            # Aplicação principal
│   ├── models/            # Modelos de dados
│   ├── routes/            # Rotas da API
│   ├── database/          # Base de dados SQLite
│   └── static/            # Frontend build
├── frontend/              # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── contexts/      # Contextos (Auth)
│   │   └── App.jsx        # Aplicação principal
│   └── dist/              # Build de produção
├── requirements.txt       # Dependências Python
└── README.md             # Este ficheiro
```

## 🔧 Configuração

### Variáveis de Ambiente
- `SECRET_KEY` - Chave secreta para JWT (gerada automaticamente)
- `DATABASE_URL` - URL da base de dados (SQLite por defeito)

### Base de Dados
A base de dados é criada automaticamente na primeira execução com as seguintes tabelas:
- `users` - Utilizadores do sistema
- `vehicles` - Veículos registados
- `vehicle_updates` - Timeline de atualizações
- `documents` - Documentos associados
- `rent_a_cars` - Empresas de rent-a-car
- `email_triggers` - Triggers de email (futuro)

## 📊 Dashboard

O dashboard apresenta:
- Total de veículos registados
- Casos em tratamento
- Casos recuperados
- Valor total em falta
- Gráficos de distribuição por status
- Gráficos de distribuição por marca
- Casos urgentes
- Taxa de recuperação
- Status geral do sistema

## 🚧 Problemas Conhecidos

- Dashboard pode não atualizar automaticamente após criação de veículos (requer refresh)
- Alguns campos podem necessitar de validação adicional

## 📝 Notas de Desenvolvimento

- Projeto criado com utilitários manus-create-flask-app e manus-create-react-app
- Frontend construído com Vite para performance otimizada
- Backend configurado para deployment em produção
- Base de dados SQLite para facilidade de desenvolvimento (migrável para PostgreSQL/MySQL)

## 🤝 Contribuição

Este projeto foi desenvolvido como sistema personalizado para gestão de recuperação de veículos. Para modificações ou melhorias, contacte o desenvolvedor.

---

**Desenvolvido por:** Manus AI Assistant  
**Data:** Agosto 2025  
**Versão:** 1.0.0

