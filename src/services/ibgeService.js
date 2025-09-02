// Serviço para integração com a API do IBGE
// Fornece dados de municípios e estados brasileiros

/**
 * Busca todos os municípios do Brasil via API do IBGE
 * @returns {Promise<Array>} Array com todos os municípios brasileiros
 */
export const buscarTodosMunicipios = async () => {
  try {
    console.log('Buscando todos os municípios do Brasil via API do IBGE...');
    
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios');
    
    if (!response.ok) {
      throw new Error(`Erro na API do IBGE: ${response.status}`);
    }
    
    const municipios = await response.json();
    
    // Mapeia os dados para um formato mais simples
    const municipiosFormatados = municipios
      .filter(municipio => {
        // Filtra municípios com dados válidos
        return municipio && 
               municipio.microrregiao && 
               municipio.microrregiao.mesorregiao && 
               municipio.microrregiao.mesorregiao.UF;
      })
      .map(municipio => ({
        id: municipio.id,
        nome: municipio.nome,
        estado: {
          id: municipio.microrregiao.mesorregiao.UF.id,
          sigla: municipio.microrregiao.mesorregiao.UF.sigla,
          nome: municipio.microrregiao.mesorregiao.UF.nome
        },
        microrregiao: municipio.microrregiao.nome,
        mesorregiao: municipio.microrregiao.mesorregiao.nome
      }));
    
    console.log(`${municipiosFormatados.length} municípios carregados com sucesso`);
    return municipiosFormatados;
    
  } catch (error) {
    console.error('Erro ao buscar municípios:', error);
    throw new Error('Não foi possível carregar a lista de municípios. Tente novamente.');
  }
};

/**
 * Busca todos os estados do Brasil via API do IBGE
 * @returns {Promise<Array>} Array com todos os estados brasileiros
 */
export const buscarTodosEstados = async () => {
  try {
    console.log('Buscando todos os estados do Brasil via API do IBGE...');
    
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
    
    if (!response.ok) {
      throw new Error(`Erro na API do IBGE: ${response.status}`);
    }
    
    const estados = await response.json();
    
    console.log(`${estados.length} estados carregados com sucesso`);
    return estados;
    
  } catch (error) {
    console.error('Erro ao buscar estados:', error);
    throw new Error('Não foi possível carregar a lista de estados. Tente novamente.');
  }
};

/**
 * Filtra municípios por nome (busca parcial)
 * @param {Array} municipios - Array de municípios
 * @param {string} termo - Termo de busca
 * @returns {Array} Municípios filtrados
 */
export const filtrarMunicipiosPorNome = (municipios, termo) => {
  if (!termo || termo.length < 2) {
    return [];
  }
  
  const termoLower = termo.toLowerCase().trim();
  
  return municipios
    .filter(municipio => 
      municipio.nome.toLowerCase().includes(termoLower)
    )
    .sort((a, b) => {
      // Prioriza matches que começam com o termo
      const aStartsWith = a.nome.toLowerCase().startsWith(termoLower);
      const bStartsWith = b.nome.toLowerCase().startsWith(termoLower);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Ordena alfabeticamente
      return a.nome.localeCompare(b.nome);
    })
    .slice(0, 50); // Limita a 50 resultados para performance
};

/**
 * Encontra um município pelo nome exato
 * @param {Array} municipios - Array de municípios
 * @param {string} nomeMunicipio - Nome exato do município
 * @returns {Object|null} Município encontrado ou null
 */
export const encontrarMunicipioPorNome = (municipios, nomeMunicipio) => {
  if (!nomeMunicipio) return null;
  
  return municipios.find(municipio => 
    municipio.nome.toLowerCase() === nomeMunicipio.toLowerCase().trim()
  ) || null;
};