# CEPEASY - Aplicação de Busca de CEP

Uma aplicação React moderna para busca de CEP utilizando a API AwesomeAPI e Firebase para armazenamento de dados.

## 🚀 Funcionalidades

- **Busca por CEP**: Digite um CEP e obtenha informações completas do endereço
- **Busca por Endereço**: Busque CEPs através de cidade, estado e logradouro
- **Interface Responsiva**: Design moderno que funciona em desktop e mobile
- **Armazenamento Local**: Dados salvos automaticamente no Firebase Firestore
- **Cache Inteligente**: Resultados salvos localmente para consultas mais rápidas
- **Validação de Dados**: Validação automática de CEP e campos obrigatórios

## 🛠️ Tecnologias Utilizadas

- **React 18** - Biblioteca para construção da interface
- **Vite** - Build tool e dev server
- **Firebase Firestore** - Banco de dados NoSQL
- **Axios** - Cliente HTTP para requisições à API
- **AwesomeAPI** - API brasileira para consulta de CEP
- **CSS3** - Estilização com design responsivo

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Conta no Firebase (gratuita) - **OPCIONAL**

## 🔧 Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd cepeasy-app
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **A aplicação já funciona sem Firebase!**
   - A busca de CEP funciona diretamente com a API AwesomeAPI
   - O Firebase é usado apenas para cache local (opcional)

4. **Para configurar Firebase (opcional):**
   - Acesse [Firebase Console](https://console.firebase.google.com/)
   - Crie um novo projeto ou selecione um existente
   - Ative o Firestore Database
   - Vá em "Configurações do projeto" > "Geral"
   - Na seção "Seus apps", adicione um app Web
   - Copie as configurações do Firebase

5. **Configure as variáveis de ambiente (opcional)**
   ```bash
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` e adicione suas credenciais do Firebase:
   ```env
   VITE_FIREBASE_API_KEY=sua-api-key
   VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=seu-project-id
   VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
   VITE_FIREBASE_APP_ID=seu-app-id
   ```

5. **Execute a aplicação**
   ```bash
   npm run dev
   ```

   A aplicação estará disponível em `http://localhost:5173`

## 📱 Como Usar

### Busca por CEP
1. Selecione a aba "Buscar por CEP"
2. Digite o CEP no formato 00000-000 ou 00000000
3. Clique em "Buscar CEP"
4. Os dados do endereço serão exibidos automaticamente

### Busca por Endereço
1. Selecione a aba "Buscar por Endereço"
2. Preencha pelo menos cidade e estado (UF)
3. Opcionalmente, adicione o logradouro para refinar a busca
4. Clique em "Buscar Endereço"
5. Uma lista de endereços correspondentes será exibida

## 🏗️ Estrutura do Projeto

```
cepeasy-app/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── BuscaCEP.jsx
│   │   └── BuscaCEP.css
│   ├── services/
│   │   └── cepService.js
│   ├── App.jsx
│   ├── App.css
│   ├── firebase.js
│   ├── index.css
│   └── main.jsx
├── .env.example
├── package.json
└── README.md
```

## 🔗 API Utilizada

Este projeto utiliza a [AwesomeAPI](https://docs.awesomeapi.com.br/api-cep) para consulta de CEP:

- **Endpoint**: `https://cep.awesomeapi.com.br/json/{cep}`
- **Formato**: JSON
- **Gratuita**: Sem necessidade de chave de API

## 🚀 Build para Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas, por favor abra uma issue no repositório.

---

**Desenvolvido com ❤️ usando React + Vite + Firebase**

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
