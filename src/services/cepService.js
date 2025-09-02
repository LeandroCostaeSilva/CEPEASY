import axios from 'axios';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// URL base da API AwesomeAPI
const API_BASE_URL = 'https://cep.awesomeapi.com.br/json';

// Função para buscar CEP na API AwesomeAPI
export const buscarCEP = async (cep) => {
  try {
    // Remove caracteres não numéricos do CEP
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      throw new Error('CEP deve conter 8 dígitos');
    }

    const response = await axios.get(`${API_BASE_URL}/${cepLimpo}`);
    
    // Verifica se a resposta contém dados válidos
    if (response.data && response.data.status === 400) {
      throw new Error('CEP inválido');
    }
    
    if (!response.data || !response.data.cep) {
      throw new Error('CEP não encontrado');
    }
    
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('CEP não encontrado');
      }
      if (error.response.status === 400) {
        throw new Error('CEP inválido');
      }
    }
    
    // Se for erro de rede ou outro erro
    if (error.message.includes('Network Error') || error.code === 'NETWORK_ERROR') {
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    }
    
    throw new Error(error.message || 'Erro ao buscar CEP');
  }
};

// Função para buscar endereço por dados (cidade, estado, logradouro)
export const buscarEnderecoPorDados = async (cidade, estado, logradouro) => {
  try {
    // Validação dos parâmetros
    if (!cidade || cidade.length < 3) {
      throw new Error('Cidade deve ter pelo menos 3 caracteres');
    }
    if (!estado || estado.length !== 2) {
      throw new Error('Estado deve ter 2 caracteres (UF)');
    }
    if (!logradouro || logradouro.length < 3) {
      throw new Error('Logradouro deve ter pelo menos 3 caracteres');
    }

    // Busca na API do ViaCEP por endereço
    const url = `https://viacep.com.br/ws/${encodeURIComponent(estado)}/${encodeURIComponent(cidade)}/${encodeURIComponent(logradouro)}/json/`;
    
    console.log('Buscando endereço na API ViaCEP:', url);
    
    const response = await axios.get(url);
    
    if (!response.data || response.data.length === 0) {
      // Se não encontrou na API, tenta buscar nos endereços salvos localmente
      console.log('Nenhum resultado na API, buscando localmente...');
      const enderecosSalvos = await buscarEnderecosSalvos();
      
      const resultados = enderecosSalvos.filter(endereco => {
        const cidadeMatch = endereco.localidade && 
          endereco.localidade.toLowerCase().includes(cidade.toLowerCase());
        const estadoMatch = endereco.uf && 
          endereco.uf.toLowerCase() === estado.toLowerCase();
        const logradouroMatch = endereco.logradouro && 
          endereco.logradouro.toLowerCase().includes(logradouro.toLowerCase());
        
        return cidadeMatch && estadoMatch && logradouroMatch;
      });
      
      return resultados;
    }
    
    // Filtra e formata os resultados da API
    const resultados = response.data
      .filter(endereco => endereco && endereco.cep && !endereco.erro)
      .map(endereco => ({
        cep: endereco.cep,
        logradouro: endereco.logradouro || '',
        complemento: endereco.complemento || '',
        bairro: endereco.bairro || '',
        localidade: endereco.localidade || cidade,
        uf: endereco.uf || estado,
        estado: endereco.estado || '',
        regiao: endereco.regiao || '',
        ibge: endereco.ibge || '',
        gia: endereco.gia || '',
        ddd: endereco.ddd || '',
        siafi: endereco.siafi || ''
      }));
    
    console.log(`Encontrados ${resultados.length} resultados na API`);
    return resultados;
    
  } catch (error) {
    console.error('Erro ao buscar endereço por dados:', error);
    
    // Em caso de erro na API, tenta buscar localmente
    try {
      console.log('Erro na API, tentando busca local...');
      const enderecosSalvos = await buscarEnderecosSalvos();
      
      const resultados = enderecosSalvos.filter(endereco => {
        const cidadeMatch = endereco.localidade && 
          endereco.localidade.toLowerCase().includes(cidade.toLowerCase());
        const estadoMatch = endereco.uf && 
          endereco.uf.toLowerCase() === estado.toLowerCase();
        const logradouroMatch = endereco.logradouro && 
          endereco.logradouro.toLowerCase().includes(logradouro.toLowerCase());
        
        return cidadeMatch && estadoMatch && logradouroMatch;
      });
      
      return resultados;
    } catch (localError) {
      console.error('Erro na busca local:', localError);
      throw new Error('Não foi possível buscar o endereço. Verifique os dados informados e tente novamente.');
    }
  }
};

// Função para salvar endereço no Firebase
export const salvarEndereco = async (dadosEndereco) => {
  try {
    const docRef = await addDoc(collection(db, 'enderecos'), {
      ...dadosEndereco,
      timestamp: new Date()
    });
    return docRef.id;
  } catch (error) {
    // Se Firebase não estiver configurado, apenas loga o erro sem quebrar a aplicação
    console.warn('Firebase não configurado ou erro ao salvar:', error.message);
    return null;
  }
};

// Função para buscar endereços salvos no Firebase
export const buscarEnderecosSalvos = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'enderecos'));
    const enderecos = [];
    querySnapshot.forEach((doc) => {
      enderecos.push({ id: doc.id, ...doc.data() });
    });
    return enderecos;
  } catch (error) {
    // Se Firebase não estiver configurado, retorna array vazio
    console.warn('Firebase não configurado ou erro ao buscar endereços salvos:', error.message);
    return [];
  }
};

// Função para buscar por CEP específico no Firebase
export const buscarCEPSalvo = async (cep) => {
  try {
    const q = query(collection(db, 'enderecos'), where('cep', '==', cep));
    const querySnapshot = await getDocs(q);
    const enderecos = [];
    querySnapshot.forEach((doc) => {
      enderecos.push({ id: doc.id, ...doc.data() });
    });
    return enderecos;
  } catch (error) {
    // Se Firebase não estiver configurado, retorna array vazio
    console.warn('Firebase não configurado ou erro ao buscar CEP salvo:', error.message);
    return [];
  }
};