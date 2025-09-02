import React, { useState, useEffect, useRef } from 'react';
import './AutocompleteCidade.css';

const AutocompleteCidade = ({ 
  value, 
  onChange, 
  onSelect, 
  municipios, 
  placeholder = "Digite o nome da cidade...",
  disabled = false,
  loading = false 
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [sugestoes, setSugestoes] = useState([]);
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Atualiza o valor do input quando o prop value muda
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Filtra municípios baseado no input
  useEffect(() => {
    if (inputValue.length >= 2 && municipios.length > 0) {
      const termoLower = inputValue.toLowerCase().trim();
      
      const municipiosFiltrados = municipios
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
        .slice(0, 10); // Limita a 10 resultados
      
      setSugestoes(municipiosFiltrados);
      setShowSugestoes(true);
      setSelectedIndex(-1);
    } else {
      setSugestoes([]);
      setShowSugestoes(false);
      setSelectedIndex(-1);
    }
  }, [inputValue, municipios]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleSugestaoClick = (municipio) => {
    setInputValue(municipio.nome);
    setShowSugestoes(false);
    setSelectedIndex(-1);
    onChange(municipio.nome);
    if (onSelect) {
      onSelect(municipio);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSugestoes || sugestoes.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < sugestoes.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : sugestoes.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < sugestoes.length) {
          handleSugestaoClick(sugestoes[selectedIndex]);
        }
        break;
      
      case 'Escape':
        setShowSugestoes(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      
      default:
        break;
    }
  };

  const handleBlur = (e) => {
    // Delay para permitir clique nas sugestões
    setTimeout(() => {
      setShowSugestoes(false);
      setSelectedIndex(-1);
    }, 150);
  };

  const handleFocus = () => {
    if (inputValue.length >= 2 && sugestoes.length > 0) {
      setShowSugestoes(true);
    }
  };

  return (
    <div className="autocomplete-container">
      <div className="input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={loading ? "Carregando cidades..." : placeholder}
          disabled={disabled || loading}
          className="autocomplete-input"
          autoComplete="off"
        />
        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
          </div>
        )}
      </div>
      
      {showSugestoes && sugestoes.length > 0 && (
        <ul ref={listRef} className="autocomplete-sugestoes">
          {sugestoes.map((municipio, index) => (
            <li
              key={municipio.id}
              className={`autocomplete-sugestao ${
                index === selectedIndex ? 'selected' : ''
              }`}
              onClick={() => handleSugestaoClick(municipio)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="municipio-nome">{municipio.nome}</div>
              <div className="municipio-estado">
                {municipio.estado.nome} ({municipio.estado.sigla})
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {showSugestoes && inputValue.length >= 2 && sugestoes.length === 0 && !loading && (
        <div className="autocomplete-no-results">
          Nenhuma cidade encontrada
        </div>
      )}
      
      {loading && inputValue.length >= 2 && (
        <div className="autocomplete-loading">
          Carregando cidades...
        </div>
      )}
    </div>
  );
};

export default AutocompleteCidade;