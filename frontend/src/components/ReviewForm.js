import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Star, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ReviewForm = ({ onSuccess }) => {
  const { user, token } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Por favor, selecione uma nota de 1 a 5 estrelas');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/reviews`, {
        rating,
        title: title || null,
        comment: comment || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSubmitted(true);
      toast.success('Obrigado pela sua avaliação! Ela será revisada pela nossa equipe.');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Erro ao enviar avaliação. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="bg-secondary/30">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Faça login para deixar sua avaliação
          </p>
        </CardContent>
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Avaliação enviada com sucesso!
          </h3>
          <p className="text-green-600 text-sm">
            Obrigado pelo seu feedback. Sua avaliação será revisada e publicada em breve.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Deixe sua Avaliação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Sua nota *
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {rating === 5 ? 'Excelente!' : 
                 rating === 4 ? 'Muito bom!' :
                 rating === 3 ? 'Bom' :
                 rating === 2 ? 'Regular' : 'Ruim'}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Título (opcional)
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Excelente serviço!"
              maxLength={100}
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Comentário (opcional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte sua experiência com a plataforma..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/500 caracteres
            </p>
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            disabled={loading || rating === 0}
            className="w-full rounded-full"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Avaliação
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
