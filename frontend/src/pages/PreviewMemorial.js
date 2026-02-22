import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { Heart, ArrowRight, CheckCircle, Edit } from 'lucide-react';
import MemorialLayout from '../components/MemorialLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PreviewMemorial = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [memorial, setMemorial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemorial = async () => {
      try {
        const response = await axios.get(`${API}/memorials/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMemorial(response.data);
      } catch (error) {
        console.error('Error fetching memorial:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemorial();
  }, [id, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20" data-testid="preview-loading">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-center mb-6">
            <Skeleton className="h-20 w-40" />
          </div>
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="pt-20 pb-6 px-6 flex flex-col items-center">
              <Skeleton className="h-32 w-32 rounded-full -mt-36 mb-4" />
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="px-6 pb-8">
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!memorial) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 text-center" data-testid="memorial-not-found">
        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-lg text-gray-500">Memorial não encontrado</p>
      </div>
    );
  }

  return (
    <div className="pt-20" data-testid="preview-memorial-page">
      {/* Banner de sucesso */}
      <div className="bg-green-50 border-b border-green-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-900">Memorial criado com sucesso!</h3>
              <p className="text-sm text-green-700">Veja abaixo como ficou sua homenagem.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Memorial Preview usando o mesmo layout */}
      <MemorialLayout memorial={memorial} isPreview={true} />

      {/* Botões de ação fixos na parte inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="flex-1 rounded-full font-semibold bg-gray-900 hover:bg-gray-800"
              onClick={() => navigate(`/select-plan/${id}`)}
              data-testid="button-choose-plan"
            >
              ESCOLHER PLANO
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1 rounded-full font-semibold"
              onClick={() => navigate('/create-memorial')}
              data-testid="button-edit"
            >
              <Edit className="mr-2 h-5 w-5" />
              Criar Outro
            </Button>
          </div>
        </div>
      </div>

      {/* Espaço para os botões fixos */}
      <div className="h-24" />
    </div>
  );
};

export default PreviewMemorial;
