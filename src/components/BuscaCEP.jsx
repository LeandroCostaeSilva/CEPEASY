import React, { useState, useEffect } from 'react';
import { buscarCEP, buscarEnderecoPorDados, salvarEndereco, buscarCEPSalvo } from '../services/cepService';
import { buscarTodosMunicipios } from '../services/ibgeService';
import AutocompleteCidade from './AutocompleteCidade';
import './BuscaCEP.css';

const BuscaCEP = () => {
  const [cep, setCep] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [resultado, setResultado] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [tipoBusca, setTipoBusca] = useState('cep'); // 'cep' ou 'endereco'
  const [municipios, setMunicipios] = useState([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  // Carregar municípios do IBGE na inicialização
  useEffect(() => {
    const carregarMunicipios = async () => {
      setLoadingMunicipios(true);
      try {
        const todosMunicipios = await buscarTodosMunicipios();
        setMunicipios(todosMunicipios);
        console.log('Municípios carregados:', todosMunicipios.length);
      } catch (error) {
        console.error('Erro ao carregar municípios:', error);
        // Não exibe erro para o usuário, apenas registra no console
      } finally {
        setLoadingMunicipios(false);
      }
    };

    carregarMunicipios();
  }, []);

  // Função para formatar CEP
  const formatarCEP = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    if (apenasNumeros.length <= 8) {
      return apenasNumeros.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return apenasNumeros.slice(0, 8).replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  // Função chamada quando uma cidade é selecionada no autocomplete
  const handleCidadeSelect = (municipio) => {
    setCidade(municipio.nome);
    setEstado(municipio.estado.sigla);
    console.log('Cidade selecionada:', municipio.nome, 'Estado:', municipio.estado.sigla);
  };

  // Função para lidar com mudanças manuais no campo cidade
  const handleCidadeChange = (valor) => {
    setCidade(valor);
    // Se o usuário limpar o campo cidade, limpa também o estado
    if (!valor.trim()) {
      setEstado('');
    }
  };

  // Buscar por CEP
  const handleBuscarCEP = async (e) => {
    e.preventDefault();
    if (!cep.trim()) {
      setErro('Por favor, digite um CEP');
      return;
    }

    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      setErro('CEP deve conter 8 dígitos');
      return;
    }

    setLoading(true);
    setErro('');
    setSucesso('');
    setResultado(null);

    try {
      // Primeiro, verifica se o CEP já está salvo no Firebase
      const cepSalvo = await buscarCEPSalvo(cepLimpo);
      
      if (cepSalvo.length > 0) {
          setResultado(cepSalvo[0]);
          setSucesso('CEP encontrado no cache local!');
          console.log('CEP encontrado no cache local');
        } else {
          // Se não estiver salvo, busca na API
          console.log('Buscando CEP na API AwesomeAPI...');
          const dadosCEP = await buscarCEP(cep);
          setResultado(dadosCEP);
          setSucesso('CEP encontrado com sucesso!');
          
          // Tenta salvar automaticamente no Firebase (não falha se Firebase não estiver configurado)
          const savedId = await salvarEndereco(dadosCEP);
          if (savedId) {
            console.log('CEP salvo no Firebase com sucesso');
          }
        }
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Buscar por endereço
  const handleBuscarEndereco = async (e) => {
    e.preventDefault();
    if (!cidade.trim() || !estado.trim()) {
      setErro('Por favor, preencha pelo menos cidade e estado');
      return;
    }

    setLoading(true);
    setErro('');
    setSucesso('');
    setResultados([]);

    try {
      const enderecos = await buscarEnderecoPorDados(cidade, estado, logradouro);
      setResultados(enderecos);
      
      if (enderecos.length === 0) {
        setErro('Nenhum endereço encontrado com os dados informados');
      }
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Limpar formulário
  const limparFormulario = () => {
    setCep('');
    setCidade('');
    setEstado('');
    setLogradouro('');
    setResultado(null);
    setResultados([]);
    setErro('');
    setSucesso('');
  };

  return (
    <div className="busca-cep-container">
      <div className="busca-cep-card">
        <h1 className="titulo">CEPEASY - Busca de CEP</h1>
        
        {/* Seletor de tipo de busca */}
        <div className="tipo-busca">
          <button 
            className={`btn-tipo ${tipoBusca === 'cep' ? 'ativo' : ''}`}
            onClick={() => setTipoBusca('cep')}
          >
            Buscar por CEP
          </button>
          <button 
            className={`btn-tipo ${tipoBusca === 'endereco' ? 'ativo' : ''}`}
            onClick={() => setTipoBusca('endereco')}
          >
            Buscar por Endereço
          </button>
        </div>

        {/* Formulário de busca por CEP */}
        {tipoBusca === 'cep' && (
          <form onSubmit={handleBuscarCEP} className="formulario">
            <div className="campo">
              <label htmlFor="cep">CEP:</label>
              <input
                type="text"
                id="cep"
                value={cep}
                onChange={(e) => setCep(formatarCEP(e.target.value))}
                placeholder="00000-000"
                maxLength="9"
                className="input-cep"
              />
            </div>
            <div className="botoes">
              <button type="submit" disabled={loading} className="btn-buscar">
                {loading ? 'Buscando...' : 'Buscar CEP'}
              </button>
              <button type="button" onClick={limparFormulario} className="btn-limpar">
                Limpar
              </button>
            </div>
          </form>
        )}

        {/* Formulário de busca por endereço */}
        {tipoBusca === 'endereco' && (
          <form onSubmit={handleBuscarEndereco} className="formulario">
            <div className="campo">
              <label htmlFor="cidade">Cidade:</label>
              <AutocompleteCidade
                municipios={municipios}
                loading={loadingMunicipios}
                value={cidade}
                onChange={handleCidadeChange}
                onSelect={handleCidadeSelect}
                placeholder="Digite o nome da cidade"
              />
            </div>
            <div className="campo">
              <label htmlFor="estado">Estado (UF):</label>
              <input
                type="text"
                id="estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value.toUpperCase())}
                placeholder="SP"
                maxLength="2"
                className="input-texto"
                readOnly
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
            </div>
            <div className="campo">
              <label htmlFor="logradouro">Logradouro (opcional):</label>
              <input
                type="text"
                id="logradouro"
                value={logradouro}
                onChange={(e) => setLogradouro(e.target.value)}
                placeholder="Nome da rua, avenida..."
                className="input-texto"
              />
            </div>
            <div className="botoes">
              <button type="submit" disabled={loading} className="btn-buscar">
                {loading ? 'Buscando...' : 'Buscar Endereço'}
              </button>
              <button type="button" onClick={limparFormulario} className="btn-limpar">
                Limpar
              </button>
            </div>
          </form>
        )}

        {/* Exibição de erro */}
        {erro && (
          <div className="erro">
            <p>{erro}</p>
          </div>
        )}

        {/* Exibição de sucesso */}
        {sucesso && (
          <div className="sucesso">
            <p>{sucesso}</p>
          </div>
        )}

        {/* Resultado da busca por CEP */}
        {resultado && (
          <div className="resultado">
            <h3>Resultado:</h3>
            <div className="dados-endereco">
              <p><strong>CEP:</strong> {resultado.cep}</p>
              <p><strong>Endereço:</strong> {resultado.address}</p>
              <p><strong>Bairro:</strong> {resultado.district}</p>
              <p><strong>Cidade:</strong> {resultado.city}</p>
              <p><strong>Estado:</strong> {resultado.state}</p>
              <p><strong>DDD:</strong> {resultado.ddd}</p>
              {resultado.lat && resultado.lng && (
                <p><strong>Coordenadas:</strong> {resultado.lat}, {resultado.lng}</p>
              )}
            </div>
          </div>
        )}

        {/* Resultados da busca por endereço */}
        {resultados.length > 0 && (
          <div className="resultados">
            <h3>Resultados encontrados ({resultados.length}):</h3>
            <div className="dados-busca">
              <p><strong>Dados da busca:</strong></p>
              <p><strong>Endereço buscado:</strong> {logradouro || 'Não informado'}</p>
              <p><strong>Cidade:</strong> {cidade}</p>
              <p><strong>Estado:</strong> {estado}</p>
            </div>
            <div className="lista-resultados">
              {resultados.map((endereco, index) => (
                <div key={index} className="item-resultado">
                  <p><strong>CEP:</strong> {endereco.cep}</p>
                  <p><strong>Logradouro:</strong> {endereco.logradouro || endereco.address || 'Não informado'}</p>
                  <p><strong>Complemento:</strong> {endereco.complemento || 'Não informado'}</p>
                  <p><strong>Bairro:</strong> {endereco.bairro || endereco.district || 'Não informado'}</p>
                  <p><strong>Cidade:</strong> {endereco.localidade || endereco.city || cidade}</p>
                  <p><strong>Estado:</strong> {endereco.uf || endereco.state || estado}</p>
                  {endereco.ddd && <p><strong>DDD:</strong> {endereco.ddd}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuscaCEP;