import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Skeleton } from '../components/ui/skeleton';
import { Heart } from 'lucide-react';
import MemorialLayout from '../components/MemorialLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MemorialView = () => {
  const { id } = useParams();
  const [memorial, setMemorial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemorial = async () => {
      try {
        const response = await axios.get(`${API}/memorials/${id}`);
        setMemorial(response.data);
      } catch (error) {
        console.error('Error fetching memorial:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemorial();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20" data-testid="memorial-view-loading">
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
    <div className="" data-testid="memorial-view-page">
      <MemorialLayout memorial={memorial} />
    </div>
  );
};

export default MemorialView;
