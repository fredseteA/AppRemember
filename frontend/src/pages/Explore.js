import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Heart } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Explore = () => {
  const [memorials, setMemorials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemorials = async () => {
      try {
        const response = await axios.get(`${API}/memorials/explore`);
        setMemorials(response.data);
      } catch (error) {
        console.error('Error fetching memorials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemorials();
  }, []);

  if (loading) {
    return (
      <div className="pt-32 pb-24" data-testid="explore-page-loading">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Skeleton className="h-12 w-64 mx-auto mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24" data-testid="explore-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h1
            className="text-5xl md:text-7xl font-light tracking-tight leading-tight mb-6"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
            data-testid="page-title"
          >
            Explorar Memoriais
          </h1>
          <p className="text-lg md:text-xl leading-relaxed font-light text-muted-foreground max-w-3xl mx-auto">
            Homenagens eternas que preservam memórias e histórias de vidas especiais
          </p>
        </div>

        {memorials.length === 0 ? (
          <div className="text-center py-20" data-testid="no-memorials-message">
            <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              Ainda não há memoriais públicos disponíveis.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Seja o primeiro a criar um memorial e compartilhar uma história de vida.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" data-testid="memorials-grid">
            {memorials.map((memorial) => (
              <Link key={memorial.id} to={`/memorial/${memorial.id}`} data-testid={`memorial-card-${memorial.id}`}>
                <Card className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_40px_-10px_rgba(197,160,89,0.15)] transition-all duration-700 group h-full">
                  <div className="relative h-64 overflow-hidden">
                    {memorial.person_data.photo_url ? (
                      <img
                        src={memorial.person_data.photo_url}
                        alt={memorial.person_data.full_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary/50 flex items-center justify-center">
                        <Heart className="h-16 w-16 text-primary/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </div>
                  <CardContent className="p-6">
                    <h3
                      className="text-2xl font-light mb-2"
                      style={{ fontFamily: 'Cormorant Garamond, serif' }}
                    >
                      {memorial.person_data.full_name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {memorial.person_data.birth_city}, {memorial.person_data.birth_state}
                    </p>
                    {memorial.content.main_phrase && (
                      <p
                        className="text-sm italic text-muted-foreground line-clamp-2"
                        style={{ fontFamily: 'Pinyon Script, cursive' }}
                      >
                        "{memorial.content.main_phrase}"
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;