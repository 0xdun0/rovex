# 🎙️ GuiaFlow — Roteiro de Tour Interativo & Narração Oficial Rovex

> **Guia de Implementação no GuiaFlow**:
> Este documento contém o roteiro completo passo a passo para captura, configuração no editor e gravação de áudio (narração TTS) do tour interativo da plataforma **Rovex**.
> Cada passo especifica a **tela/rota**, o **elemento a ser destacado**, a **ação simulada**, o **texto narrado para gerar a locução** e a **mensagem do balão na interface**.

---

## 📌 Visão Geral do Tour

- **Produto**: Rovex — Autonomous Security Reporting & Vulnerability Management
- **Objetivo**: Apresentar a plataforma para novos auditores, desde o primeiro acesso e configuração inicial até o fluxo de trabalho de achados e exportação de relatórios.
- **Duração estimada do áudio**: ~4 a 5 minutos.
- **Tom de voz**: Profissional, confiante, moderno, voltado para cibersegurança ofensiva e privacidade absoluta.

---

## 🧭 Roteiro Passo a Passo

---

### PASSO 1: Boas-vindas e Controles Globais (Idioma & Tema)
- **Rota**: `/`
- **Elemento para destacar**: Barra superior direita (`LanguageToggleButton` e `ThemeToggleButton`).
- **Ação**: Focar no botão de idioma e alternar o tema.
- **Texto do Balão (Interface)**:
  > **Bem-vindo ao Rovex!**
  > Antes de começar, personalize sua experiência: a plataforma suporta 3 idiomas nativos (Português, Inglês e Espanhol) e modos Dark/Light com contraste calibrado para auditorias prolongadas.
- **Texto Narrado (Voz)**:
  > *"Bem-vindo ao Rovex, a estação soberana para gestão de vulnerabilidades e geração autônoma de relatórios de pentest. No canto superior direito, você tem controle total da interface: alterne instantaneamente entre Português, Inglês ou Espanhol, e escolha entre o modo escuro tático ou o modo claro de alto contraste. Toda a interface se adapta em tempo real sem recarregar a página."*

---

### PASSO 2: O Pilar Local-First & Zero Telemetria
- **Rota**: `/`
- **Elemento para destacar**: Card lateral esquerdo de apresentação e pilares de segurança (`Zero Telemetria & Armazenamento Local`, `Compilador AST Multi-Formato`, `Assistente IA via MCP`).
- **Ação**: Rolar suavemente e destacar os badges de segurança.
- **Texto do Balão (Interface)**:
  > **100% Privado & Local-First**
  > Nenhum dado de cliente, achado ou vulnerabilidade sai da sua máquina ou servidor local. Zero telemetria, zero nuvem de terceiros.
- **Texto Narrado (Voz)**:
  > *"O Rovex foi projetado sob a filosofia local-first e telemetria zero. Isso significa que relatórios confidenciais, evidências de exploração e dados dos seus clientes nunca trafegam em servidores externos. Tudo é armazenado e processado diretamente no seu host com persistência atômica."*

---

### PASSO 3: Criando a Conta de Auditor (Primeiro Acesso)
- **Rota**: `/`
- **Elemento para destacar**: Aba `CRIAR CONTA` e formulário de cadastro.
- **Ação**: Clicar na aba "CRIAR CONTA" e preencher o campo `Nome de Usuário`.
- **Texto do Balão (Interface)**:
  > **Registro do Operador**
  > Defina seu codinome ou nome técnico de auditor. Este identificador assinará a estação de trabalho local.
- **Texto Narrado (Voz)**:
  > *"No primeiro acesso à estação, vamos criar sua conta mestre de auditor. Digite seu codinome ou nome de operador no primeiro campo. Ele identificará sua estação e será utilizado para assinar os relatórios técnicos gerados pela plataforma."*

---

### PASSO 4: E-mail Profissional e Senha Mestre Criptográfica
- **Rota**: `/`
- **Elemento para destacar**: Campos `E-mail Profissional`, `Definir Senha Mestre` e a barra de força da senha.
- **Ação**: Digitar o e-mail, inserir uma senha forte e observar o medidor mudar para "Forte / Imbatível".
- **Texto do Balão (Interface)**:
  > **Proteção Criptográfica PBKDF2**
  > Insira seu e-mail profissional e defina uma senha mestra de alta entropia. O medidor indica em tempo real a resistência da chave.
- **Texto Narrado (Voz)**:
  > *"Em seguida, insira seu e-mail profissional. Ao definir sua senha mestre, o medidor em tempo real avalia o nível de segurança da credencial. Suas chaves de acesso são derivadas localmente utilizando PBKDF2 com algoritmo SHA-256 e cento e cinquenta mil iterações, garantindo proteção contra ataques de força bruta mesmo se o banco de dados for exposto."*

---

### PASSO 5: Confirmação e Inicialização Criptográfica
- **Rota**: `/`
- **Elemento para destacar**: Campo `Confirmar Senha Mestre` e botão `Criar Conta e Iniciar Configuração`.
- **Ação**: Digitar confirmação da senha e clicar no botão principal. Em seguida, destacar a tela de carregamento progressivo do Rovex.
- **Texto do Balão (Interface)**:
  > **Calibrando Ambiente Local**
  > A estação deriva suas chaves, calibra os templates e inicializa o espaço de trabalho.
- **Texto Narrado (Voz)**:
  > *"Confirme sua senha e clique em 'Criar Conta e Iniciar Configuração'. O Rovex agora deriva as chaves criptográficas da sua estação, calibra os modelos de relatório e prepara seu guia personalizado de configuração."*

---

### PASSO 6: Boas-vindas ao Setup da Estação
- **Rota**: `/setup`
- **Elemento para destacar**: Barra de progresso superior do Setup Guide e o cabeçalho "Configuração da Estação Rovex".
- **Ação**: Focar na barra de progresso (0% de conclusão inicial) e no campo de busca do setup.
- **Texto do Balão (Interface)**:
  > **Guia Interativo de Setup**
  > Em 5 etapas rápidas, você prepara seu perfil, define a estética dos relatórios, cadastra seu primeiro cliente e valida a IA.
- **Texto Narrado (Voz)**:
  > *"Você agora está no Guia de Configuração da Estação. Uma barra de progresso intuitiva no topo acompanha cada etapa concluída. A qualquer momento, você pode utilizar a busca inteligente integrada para saltar diretamente para qualquer tarefa ou documentação."*

---

### PASSO 7: Etapa 1 — Perfil e Assinatura do Auditor
- **Rota**: `/setup`
- **Elemento para destacar**: Seção 1 expandida: `Perfil de Auditor` (Campos: Nome do Consultor, Cargo Técnico, Empresa, E-mail, Telefone Seguro e Avatar).
- **Ação**: Preencher os campos do perfil do consultor e salvar a etapa.
- **Texto do Balão (Interface)**:
  > **Assinatura Técnica nos Relatórios**
  > Estes dados são interpolados automaticamente nos relatórios através das tags `{{ pentester.name }}` e `{{ pentester.email }}`.
- **Texto Narrado (Voz)**:
  > *"Na primeira etapa, personalizamos o seu perfil de auditor. Insira seu nome completo, cargo técnico como Consultor de Segurança Sênior, o nome da sua consultoria e seus contatos seguros. Esses dados alimentam automaticamente o cabeçalho e a folha de rosto dos seus relatórios através do motor de templates."*

---

### PASSO 8: Etapa 2 — Identidade Visual do Relatório
- **Rota**: `/setup`
- **Elemento para destacar**: Seção 2: `Tema do Relatório` (Cards de seleção visual de temas: Midnight Stealth, Cobalt Executive, Crimson Red, etc.).
- **Ação**: Selecionar um dos temas visuais e observar a pré-visualização das cores.
- **Texto do Balão (Interface)**:
  > **Estilo Executivo DOCX e PDF**
  > Escolha a paleta de cores corporativa que será aplicada nas tabelas de vulnerabilidade e gráficos de CVSS.
- **Texto Narrado (Voz)**:
  > *"Na etapa dois, você define o tema visual padrão dos relatórios. O Rovex inclui paletas corporativas e escuras pré-configuradas que garantem acabamento de alto nível para entregas executivas em Word, PDF e HTML."*

---

### PASSO 9: Etapa 3 — Cadastrando a Organização Alvo (Recon & Logos)
- **Rota**: `/setup`
- **Elemento para destacar**: Seção 3: `Cadastrar Cliente Alvo` e botão `Registrar Alvo`.
- **Ação**: Abrir o modal de criação de alvo, preencher nome e contato, e destacar as abas de upload de logo (1:1 e 3:1).
- **Texto do Balão (Interface)**:
  > **Entidade Auditada & Branding**
  > Cadastre a empresa auditada e vincule a logo primária (1:1) e o banner horizontal (3:1) com suporte a arrastar e soltar.
- **Texto Narrado (Voz)**:
  > *"Na etapa três, cadastramos sua primeira organização alvo. Informe o nome da entidade auditada, como Hack The Box ou Banco Alfa, o responsável técnico e um canal seguro. Na área de branding, você conta com um componente de upload limpo e espaçoso para anexar a logo quadrada de avatar e o banner horizontal de cabeçalho, com suporte a recorte e enquadramento."*

---

### PASSO 10: Etapa 4 — Template de Auditoria
- **Rota**: `/setup`
- **Elemento para destacar**: Seção 4: `Template de Auditoria` (Cards de seleção: CPTS Certified Penetration Tester, HTB Lab Writeup, Web Application OWASP).
- **Ação**: Clicar para selecionar o template `CPTS / Pentest Corporativo`.
- **Texto do Balão (Interface)**:
  > **Estrutura Pronta de Relatório**
  > Metodologias consolidadas com seções de Sumário Executivo, Escopo, Matriz CVSS e Passos de Remediação.
- **Texto Narrado (Voz)**:
  > *"Na etapa quatro, escolhemos a estrutura de relatório. O Rovex já traz templates homologados para certificações como CPTS e auditorias Web OWASP, com todas as seções obrigatórias estruturadas prontas para uso."*

---

### PASSO 11: Etapa 5 — Conexão MCP / Assistente IA
- **Rota**: `/setup`
- **Elemento para destacar**: Seção 5: `Integração MCP / IA` e o botão `Testar Conexão MCP`.
- **Ação**: Clicar em "Testar Conexão MCP" e observar o indicador verde de validação com ping em `/api/mcp`.
- **Texto do Balão (Interface)**:
  > **Model Context Protocol Nativo**
  > Conecte assistentes de IA como Claude, Cursor ou modelos locais para gerar descrições e validar achados via MCP.
- **Texto Narrado (Voz)**:
  > *"A quinta etapa valida o Model Context Protocol. O Rovex expõe um endpoint local de IA que permite a ferramentas como Claude Desktop e Cursor inspecionar o estado do relatório, sugerir mitigações e preencher evidências de forma assistida, mantendo os dados no seu controle."*

---

### PASSO 12: Conclusão do Setup e Acesso à Estação
- **Rota**: `/setup`
- **Elemento para destacar**: Botão final `Avançar para Estação de Trabalho` no rodapé da página.
- **Ação**: Clicar no botão para redirecionar para `/report`.
- **Texto do Balão (Interface)**:
  > **Estação Calibrada com Sucesso!**
  > Com o ambiente configurado, você tem acesso completo ao dashboard de projetos e relatórios.
- **Texto Narrado (Voz)**:
  > *"Com todas as etapas concluídas com sucesso, clicamos em 'Avançar para Estação de Trabalho'. O setup está finalizado e pronto para sua rotina diária de testes."*

---

### PASSO 13: Dashboard de Projetos e Alvos
- **Rota**: `/report`
- **Elemento para destacar**: Barra de navegação superior (Projetos, Alvos, Templates, Documentação), cards de métricas e botão `Novo Projeto`.
- **Ação**: Destacar a lista de auditorias e o botão `Novo Projeto`.
- **Texto do Balão (Interface)**:
  > **Painel Central de Operações**
  > Visualize o status de cada auditoria, número de vulnerabilidades ativas e prazos contratuais.
- **Texto Narrado (Voz)**:
  > *"Este é o painel central do Rovex. Aqui você gerencia múltiplos engajamentos em paralelo, acompanha o volume de vulnerabilidades por criticidade e pode iniciar um novo projeto com um clique no botão 'Novo Projeto'."*

---

### PASSO 14: Gestão Avançada de Alvos (Target Recon)
- **Rota**: `/report/7f3a9c2e81d44b6a`
- **Elemento para destacar**: Lista master-detail de organizações, dossiê do alvo e botão `Editar Alvo`.
- **Ação**: Clicar em um alvo da lista e abrir o dossiê detalhado.
- **Texto do Balão (Interface)**:
  > **Dossiê da Organização**
  > Informações de contato técnico, canais de reporte e histórico de auditorias vinculadas.
- **Texto Narrado (Voz)**:
  > *"Na seção Target Recon, você organiza os ativos de cada cliente auditado. Cada organização possui seu dossiê com dados de contato, canais criptografados de reporte e todas as auditorias e escopos historicamente vinculados."*

---

### PASSO 15: Editor de Relatórios & Workflow de Achados
- **Rota**: `/report/9a4f2c1b8e7d3a6e/[id]`
- **Elemento para destacar**: O editor split-view (Markdown de alta precisão à esquerda e visualização formatada em tempo real à direita), abas de achados e severidades.
- **Ação**: Destacar a barra de ferramentas do editor e a lista de vulnerabilidades cadastradas.
- **Texto do Balão (Interface)**:
  > **Editor Markdown em Tempo Real**
  > Escreva relatórios com sintaxe simplificada e visualize instantaneamente a formatação executiva.
- **Texto Narrado (Voz)**:
  > *"Dentro de um relatório ativo, você tem o editor Markdown split-screen. À esquerda, você redige com suporte a blocos de código com destaque de sintaxe, tabelas e tags dinâmicas. À direita, a renderização fiel ao documento final é atualizada em tempo real."*

---

### PASSO 16: Anexo de Evidências & PoC (Modal Minimalista)
- **Rota**: `/report/9a4f2c1b8e7d3a6e/[id]`
- **Elemento para destacar**: Botão de imagem na barra de ferramentas e o novo modal **Anexo de Evidência & PoC**.
- **Ação**: Clicar no botão de imagem para abrir o modal, arrastar uma imagem para o dropzone e clicar em "Inserir no Achado".
- **Texto do Balão (Interface)**:
  > **Novo Modal Minimalista de Evidências**
  > Arraste capturas de tela do exploit ou respostas HTTP. O sistema compacta localmente e insere a referência no relatório.
- **Texto Narrado (Voz)**:
  > *"Ao registrar uma vulnerabilidade, o novo modal minimalista de evidências facilita o anexo de provas de conceito. Basta arrastar capturas de tela do Burp Suite, terminais ou diagramas. A imagem é otimizada localmente sem perda de legibilidade e inserida diretamente no texto do achado com um clique."*

---

### PASSO 17: Calculadora CVSS v3.1 Integrada
- **Rota**: `/report/9a4f2c1b8e7d3a6e/[id]`
- **Elemento para destacar**: Painel de cálculo de CVSS (Vetor métrico, Severidade Crítica/Alta/Média/Baixa, Score numérico).
- **Ação**: Selecionar métricas de ataque (Network, Low Complexity, High Impact) e observar o cálculo automático da pontuação.
- **Texto do Balão (Interface)**:
  > **Padrão FIRST.org Oficial**
  > Gere o vetor de ataque CVSS v3.1 oficial e a severidade padronizada automaticamente.
- **Texto Narrado (Voz)**:
  > *"Cada vulnerabilidade conta com uma calculadora CVSS versão 3.1 integrada que segue rigorosamente o padrão FIRST. Selecione as métricas de vetor de ataque, privilégios e impacto, e o Rovex calcula o score exato, gerando a pontuação e os badges de risco do relatório."*

---

### PASSO 18: Compilação & Exportação Multi-Formato
- **Rota**: `/report/9a4f2c1b8e7d3a6e/[id]`
- **Elemento para destacar**: Menu de exportação no topo direito (`Exportar DOCX`, `Exportar PDF`, `Exportar HTML`).
- **Ação**: Clicar no menu de exportação e demonstrar o download imediato do documento Word.
- **Texto do Balão (Interface)**:
  > **Compilação Local Instantânea**
  > Gere arquivos DOCX editáveis para clientes, PDFs com sumário executivo ou pacotes HTML auto-contidos sem conexão externa.
- **Texto Narrado (Voz)**:
  > *"Com o relatório concluído, o motor de compilação gera documentos profissionais em segundos. Você pode exportar arquivos Word DOCX totalmente estilizados e editáveis para entregar ao cliente, PDFs com formatação executiva ou páginas HTML independentes — tudo compilado diretamente pelo navegador."*

---

### PASSO 19: Robô Inteligente de Documentação & Busca Semântica
- **Rota**: `/report/e3b8a1c9f4d27e5a`
- **Elemento para destacar**: Barra de pesquisa central com o robô IA e as pílulas de sugestão rápida.
- **Ação**: Digitar `apagar container` ou `dionelima@gmail.com` na busca e observar o robô resolver imediatamente a seção exata sem sobreposições.
- **Texto do Balão (Interface)**:
  > **Documentação com Assistente Semântico**
  > O robô Rovex reconhece termos de infraestrutura, comandos Docker e credenciais de auditor com sugestão instantânea de variáveis de template.
- **Texto Narrado (Voz)**:
  > *"Se precisar de ajuda a qualquer momento, o manual operacional conta com um robô de busca semântica inteligente. Digite qualquer termo — como operações de container, volumes persistentes ou até seu e-mail de auditor — e o assistente localiza instantaneamente o tópico exato e sugere as variáveis de template correspondentes para cópia com um clique."*

---

### PASSO 20: Conclusão do Tour
- **Rota**: `/report`
- **Elemento para destacar**: Logotipo Rovex e o indicador de estação ativa.
- **Ação**: Retornar suavemente ao painel principal.
- **Texto do Balão (Interface)**:
  > **Você está pronto para auditar!**
  > Segurança ofensiva com autonomia, privacidade total e relatórios impecáveis. Bom trabalho!
- **Texto Narrado (Voz)**:
  > *"Você completou o tour pelo Rovex! Sua estação está configurada, privada e pronta para elevar o padrão das suas entregas técnicas. Bom pentest e excelentes relatórios!"*

---

## 🛠️ Dicas de Gravação para o GuiaFlow

1. **Geração de Áudio (TTS)**:
   - Para voz em Português: utilize uma voz masculina ou feminina segura, firme e calma (ex: *Antonio* ou *Francisca* no Azure TTS, ou vozes *Adam / Brian / Daniel* no ElevenLabs).
   - Mantenha a velocidade da fala em `1.0x` ou `1.05x` para ritmo profissional.
2. **Destaques Visuais**:
   - Ajuste o tempo de exibição de cada passo no GuiaFlow entre **6 a 12 segundos**, sincronizando com a duração exata do arquivo de áudio narrado correspondente.
3. **Pausa entre Passos**:
   - Deixe 0.5s de silêncio no final de cada áudio para transição suave de tela.
