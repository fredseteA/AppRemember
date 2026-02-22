import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Heart, Eye, Edit } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MyMemorials = () => {
  const { token } = useAuth();
  const [memorials, setMemorials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemorials = async () => {
      try {
        const response = await axios.get(`${API}/memorials/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMemorials(response.data);
      } catch (error) {
        console.error('Error fetching memorials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemorials();
  }, [token]);

  if (loading) {
    return (
      <div className="pt-32 pb-24" data-testid="my-memorials-loading">
        <div className="max-w-7xl mx-auto px-6">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24" data-testid="my-memorials-page">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-12">
          <h1
            className="text-5xl font-light tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
            data-testid="page-title"
          >
            Meus Memoriais
          </h1>
          <Link to="/create-memorial">
            <Button className="rounded-full" data-testid="button-create-new">
              Criar Novo Memorial
            </Button>
          </Link>
        </div>

        {memorials.length === 0 ? (
          <div className="text-center py-20" data-testid="no-memorials-message">
            <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-4">
              Você ainda não criou nenhum memorial
            </p>
            <Link to="/create-memorial">
              <Button className="rounded-full">
                Criar Primeiro Memorial
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="memorials-grid">
            {memorials.map((memorial) => (
              <Card
                key={memorial.id}
                className="border border-border/50 overflow-hidden shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_40px_-10px_rgba(197,160,89,0.15)] transition-all duration-700"
                data-testid={`memorial-card-${memorial.id}`}
              >
                <div className="relative h-48 overflow-hidden">
                  {memorial.person_data.photo_url ? (
                    <img
                      src={memorial.person_data.photo_url}
                      alt={memorial.person_data.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary/50 flex items-center justify-center">
                      <Heart className="h-12 w-12 text-primary/30" />
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        memorial.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {memorial.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </span>
                    {memorial.plan_type && (
                      <span className="text-xs text-muted-foreground capitalize">
                        Plano {memorial.plan_type}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    {memorial.person_data.full_name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {memorial.person_data.relationship}
                  </p>
                  <div className="flex space-x-2">
                    <Link to={`/memorial/${memorial.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full" data-testid="button-view">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                    </Link>
                    {memorial.status === 'draft' && (
                      <Link to={`/select-plan/${memorial.id}`} className="flex-1">
                        <Button size="sm" className="w-full" data-testid="button-publish">
                          Publicar
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMemorials;