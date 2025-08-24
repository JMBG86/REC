# Sistema de Recuperação de Veículos

Sistema web completo para gestão de veículos desaparecidos de empresas de rent-a-car. Atualizado com configurações CORS corretas.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Sistema de Autenticação** - Login seguro com JWT
- **Gestão Completa de Veículos** - CRUD com todos os campos necessários
- **Painel de Controlo Analítico** - Estatísticas e gráficos em tempo real
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

## 🚀 Deploy no Render.com

### Backend
O backend está configurado para deploy automático no Render.com a partir do GitHub:

1. Conecte seu repositório GitHub ao Render.com
2. Crie um novo Web Service
3. Selecione o repositório e configure:
   - Environment: Python
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `PYTHONPATH=$PYTHONPATH:/opt/render/project gunicorn -c gunicorn_config.py 'src.main:app'`
   - Environment Variables: Configure as variáveis necessárias (DATABASE_URL, SECRET_KEY, etc.)

### Frontend
O frontend está configurado para deploy como Static Site no Render.com:

1. Conecte seu repositório GitHub ao Render.com
2. Crie um novo Static Site
3. Selecione o repositório e configure:
   - Build Command: `cd frontend && npm install --legacy-peer-deps && npm run build`
   - Publish Directory: `frontend/dist`
   - Environment Variables: Configure `VITE_API_BASE` apontando para a URL do backend

### Configuração CORS
O backend está configurado para aceitar requisições CORS dos seguintes domínios:
- http://localhost:3000 (desenvolvimento local React)
- http://localhost:5173 (desenvolvimento local Vite)
- https://rec-frontend.onrender.com
- https://rec-ub72.onrender.com

Se você estiver usando um domínio diferente, adicione-o à lista de origens permitidas no arquivo `src/main.py`.

### Scripts de Deploy
Foram criados scripts para facilitar o processo de deploy no Render.com:

- **deploy-render.sh** - Para sistemas Unix/Linux/macOS
- **deploy-render.ps1** - Para sistemas Windows

Para usar o script no Windows, execute no PowerShell:
```powershell
.\deploy-render.ps1
```

### Sistema de Login Simplificado
O sistema de login foi otimizado para:
- Usar a URL correta da API em produção e desenvolvimento
- Remover verificações redundantes de CORS
- Melhorar o desempenho reduzindo logs desnecessários
- Aumentar a segurança com cabeçalhos CORS específicos

