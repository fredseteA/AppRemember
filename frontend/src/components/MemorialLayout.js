import { useState } from 'react';
import { Share2, Image, Music, BookOpen } from 'lucide-react';
import { Button } from './ui/button';

const MemorialLayout = ({ memorial, isPreview = false, onShare }) => {
  const [activeTab, setActiveTab] = useState('historia');

  if (!memorial) return null;

  const { person_data, content, responsible } = memorial;

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      // Handle different date formats
      let date;
      if (dateString.includes('T')) {
        date = new Date(dateString);
      } else {
        // Handle YYYY-MM-DD format
        const [year, month, day] = dateString.split('-');
        date = new Date(year, month - 1, day);
      }
      
      const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch {
      return dateString;
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else if (navigator.share) {
      navigator.share({
        title: `Memorial de ${person_data.full_name}`,
        text: `Homenagem a ${person_data.full_name}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Logo no topo - apenas se não for preview (preview já tem header) */}
      {!isPreview && (
        <div className="flex justify-center pt-6 pb-4">
          <img 
            src="/logo-transparent.png" 
            alt="Remember QRCode" 
            className="h-16 w-auto"
          />
        </div>
      )}

      {/* Card principal do memorial */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Área da foto de capa e perfil */}
          <div className="relative">
            {/* Foto de capa */}
            <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
              {content.gallery_urls && content.gallery_urls.length > 0 ? (
                <img
                  src={content.gallery_urls[0]}
                  alt="Capa"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10" />
              )}
            </div>

            {/* Foto de perfil circular */}
            <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                {person_data.photo_url ? (
                  <img
                    src={person_data.photo_url}
                    alt={person_data.full_name}
                    className="w-full h-full object-cover"
                    data-testid="memorial-photo"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-4xl text-gray-400">
                      {person_data.full_name?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Botão de compartilhar */}
            <button
              onClick={handleShare}
              className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
              title="Compartilhar"
            >
              <Share2 className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Informações do memorial */}
          <div className="pt-20 pb-6 px-6 text-center">
            <p className="text-sm text-gray-500 mb-1">Em memória de</p>
            <h1 
              className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
              data-testid="memorial-name"
            >
              {person_data.full_name}
            </h1>
            
            {/* Datas */}
            <p className="text-gray-500 text-sm">
              {person_data.birth_date ? formatDate(person_data.birth_date) : '...'} 
              <span className="mx-2">—</span> 
              {person_data.death_date ? formatDate(person_data.death_date) : '...'}
            </p>

            {/* Frase principal */}
            {content.main_phrase && (
              <p className="mt-4 text-gray-600 italic text-sm px-4">
                "{content.main_phrase}"
              </p>
            )}
          </div>

          {/* Separador */}
          <div className="border-t border-gray-100" />

          {/* Tabs de navegação */}
          <div className="flex justify-center py-4 px-6 gap-8">
            <button
              onClick={() => setActiveTab('historia')}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeTab === 'historia' 
                  ? 'text-primary' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              <span className={`text-sm font-medium ${
                activeTab === 'historia' ? 'border-b-2 border-primary pb-1' : ''
              }`}>
                História
              </span>
            </button>

            <button
              onClick={() => setActiveTab('memorias')}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeTab === 'memorias' 
                  ? 'text-primary' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Image className="h-5 w-5" />
              <span className={`text-sm font-medium ${
                activeTab === 'memorias' ? 'border-b-2 border-primary pb-1' : ''
              }`}>
                Memórias
              </span>
            </button>

            <button
              onClick={() => setActiveTab('audio')}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeTab === 'audio' 
                  ? 'text-primary' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Music className="h-5 w-5" />
              <span className={`text-sm font-medium ${
                activeTab === 'audio' ? 'border-b-2 border-primary pb-1' : ''
              }`}>
                Áudio
              </span>
            </button>
          </div>

          {/* Conteúdo das tabs */}
          <div className="px-6 pb-8">
            {/* Tab História */}
            {activeTab === 'historia' && (
              <div className="animate-in fade-in duration-300" data-testid="memorial-biography">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    História de Vida
                  </h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {content.biography || 'Nenhuma história cadastrada.'}
                  </p>
                </div>
              </div>
            )}

            {/* Tab Memórias (Galeria) */}
            {activeTab === 'memorias' && (
              <div className="animate-in fade-in duration-300" data-testid="memorial-gallery">
                {content.gallery_urls && content.gallery_urls.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {content.gallery_urls.map((url, index) => (
                      <div 
                        key={index} 
                        className="aspect-square rounded-xl overflow-hidden shadow-sm"
                      >
                        <img
                          src={url}
                          alt={`Memória ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-8 text-center">
                    <Image className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhuma foto na galeria</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab Áudio */}
            {activeTab === 'audio' && (
              <div className="animate-in fade-in duration-300" data-testid="memorial-audio">
                {content.audio_url ? (
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Mensagem de Homenagem
                    </h3>
                    <audio 
                      src={content.audio_url} 
                      controls 
                      className="w-full"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-8 text-center">
                    <Music className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhum áudio cadastrado</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Rodapé com informações */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Criado com amor por {responsible?.name}</p>
        </div>
      </div>
    </div>
  );
};

export default MemorialLayout;
