import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import AuthModal from '../components/AuthModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CreateMemorial = () => {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [personData, setPersonData] = useState({
    full_name: '',
    relationship: '',
    birth_city: '',
    birth_state: '',
    death_city: '',
    death_state: '',
    photo_url: null,
    public_memorial: false
  });

  const [content, setContent] = useState({
    main_phrase: '',
    biography: '',
    gallery_urls: [],
    audio_url: null
  });

  const [responsible, setResponsible] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const handleFileUpload = async (file, path) => {
    try {
      const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao fazer upload do arquivo');
      return null;
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      const url = await handleFileUpload(file, 'photos');
      if (url) {
        setPersonData({ ...personData, photo_url: url });
        toast.success('Foto enviada com sucesso!');
      }
      setLoading(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + content.gallery_urls.length > 10) {
      toast.error('Máximo de 10 fotos na galeria');
      return;
    }

    setLoading(true);
    const urls = [];
    for (const file of files) {
      const url = await handleFileUpload(file, 'gallery');
      if (url) urls.push(url);
    }
    setContent({ ...content, gallery_urls: [...content.gallery_urls, ...urls] });
    toast.success(`${urls.length} foto(s) adicionada(s)!`);
    setLoading(false);
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      const url = await handleFileUpload(file, 'audio');
      if (url) {
        setContent({ ...content, audio_url: url });
        toast.success('Áudio enviado com sucesso!');
      }
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!personData.full_name || !personData.relationship) {
        toast.error('Preencha os campos obrigatórios');
        return;
      }
    } else if (step === 2) {
      if (!content.main_phrase || !content.biography) {
        toast.error('Preencha a frase principal e a biografia');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!responsible.name || !responsible.phone || !responsible.email) {
      toast.error('Preencha todos os dados do responsável');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API}/memorials`,
        {
          person_data: personData,
          content: content,
          responsible: responsible
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Memorial criado com sucesso!');
      navigate(`/preview/${response.data.id}`);
    } catch (error) {
      console.error('Error creating memorial:', error);
      toast.error('Erro ao criar memorial');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24" data-testid="create-memorial-page">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1
            className="text-5xl md:text-6xl font-light tracking-tight leading-tight mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
            data-testid="page-title"
          >
            {t('memorial.createTitle')}
          </h1>
          <div className="flex items-center justify-center space-x-4 mt-8">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`h-2 w-16 rounded-full transition-all duration-700 ${
                  num === step ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>

        <Card className="border border-border shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
          <CardContent className="p-8">
            {step === 1 && (
              <div className="space-y-6" data-testid="step-1">
                <h2 className="text-2xl font-light mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  {t('memorial.step1')}
                </h2>

                <div className="space-y-2">
                  <Label htmlFor="full_name">{t('memorial.fullName')} *</Label>
                  <Input
                    id="full_name"
                    value={personData.full_name}
                    onChange={(e) => setPersonData({ ...personData, full_name: e.target.value })}
                    data-testid="input-full-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relationship">{t('memorial.relationship')} *</Label>
                  <Input
                    id="relationship"
                    placeholder="Ex: Pai, Mãe, Avô, Amigo..."
                    value={personData.relationship}
                    onChange={(e) => setPersonData({ ...personData, relationship: e.target.value })}
                    data-testid="input-relationship"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birth_city">{t('memorial.birthCity')}</Label>
                    <Input
                      id="birth_city"
                      value={personData.birth_city}
                      onChange={(e) => setPersonData({ ...personData, birth_city: e.target.value })}
                      data-testid="input-birth-city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birth_state">{t('memorial.birthState')}</Label>
                    <Input
                      id="birth_state"
                      value={personData.birth_state}
                      onChange={(e) => setPersonData({ ...personData, birth_state: e.target.value })}
                      data-testid="input-birth-state"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="death_city">{t('memorial.deathCity')}</Label>
                    <Input
                      id="death_city"
                      value={personData.death_city}
                      onChange={(e) => setPersonData({ ...personData, death_city: e.target.value })}
                      data-testid="input-death-city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="death_state">{t('memorial.deathState')}</Label>
                    <Input
                      id="death_state"
                      value={personData.death_state}
                      onChange={(e) => setPersonData({ ...personData, death_state: e.target.value })}
                      data-testid="input-death-state"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">{t('memorial.photo')}</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <input
                      type="file"
                      id="photo"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      data-testid="input-photo"
                    />
                    <label htmlFor="photo" className="cursor-pointer">
                      {personData.photo_url ? (
                        <img src={personData.photo_url} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                      ) : (
                        <div>
                          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Clique para enviar uma foto</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="public_memorial"
                    checked={personData.public_memorial}
                    onCheckedChange={(checked) => setPersonData({ ...personData, public_memorial: checked })}
                    data-testid="checkbox-public"
                  />
                  <Label htmlFor="public_memorial" className="cursor-pointer">
                    {t('memorial.publicMemorial')}
                  </Label>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6" data-testid="step-2">
                <h2 className="text-2xl font-light mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  {t('memorial.step2')}
                </h2>

                <div className="space-y-2">
                  <Label htmlFor="main_phrase">{t('memorial.mainPhrase')} *</Label>
                  <Input
                    id="main_phrase"
                    placeholder="Uma frase especial para homenagear..."
                    value={content.main_phrase}
                    onChange={(e) => setContent({ ...content, main_phrase: e.target.value })}
                    data-testid="input-main-phrase"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="biography">{t('memorial.biography')} *</Label>
                  <Textarea
                    id="biography"
                    rows={8}
                    placeholder="Conte a história de vida, momentos especiais, características marcantes..."
                    value={content.biography}
                    onChange={(e) => setContent({ ...content, biography: e.target.value })}
                    data-testid="input-biography"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gallery">{t('memorial.gallery')} (Até 10 fotos)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <input
                      type="file"
                      id="gallery"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryUpload}
                      className="hidden"
                      data-testid="input-gallery"
                    />
                    <label htmlFor="gallery" className="cursor-pointer">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Clique para adicionar fotos ({content.gallery_urls.length}/10)
                      </p>
                    </label>
                  </div>
                  {content.gallery_urls.length > 0 && (
                    <div className="grid grid-cols-5 gap-2 mt-4">
                      {content.gallery_urls.map((url, index) => (
                        <img key={index} src={url} alt={`Gallery ${index + 1}`} className="w-full h-20 object-cover rounded" />
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audio">{t('memorial.audio')} (Opcional)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <input
                      type="file"
                      id="audio"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      className="hidden"
                      data-testid="input-audio"
                    />
                    <label htmlFor="audio" className="cursor-pointer">
                      {content.audio_url ? (
                        <audio src={content.audio_url} controls className="w-full" />
                      ) : (
                        <div>
                          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Clique para enviar um áudio</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6" data-testid="step-3">
                <h2 className="text-2xl font-light mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  {t('memorial.step3')}
                </h2>

                <div className="space-y-2">
                  <Label htmlFor="responsible_name">{t('memorial.responsibleName')} *</Label>
                  <Input
                    id="responsible_name"
                    value={responsible.name}
                    onChange={(e) => setResponsible({ ...responsible, name: e.target.value })}
                    data-testid="input-responsible-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('memorial.phone')} *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+55 (00) 00000-0000"
                    value={responsible.phone}
                    onChange={(e) => setResponsible({ ...responsible, phone: e.target.value })}
                    data-testid="input-phone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')} *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={responsible.email}
                    onChange={(e) => setResponsible({ ...responsible, email: e.target.value })}
                    data-testid="input-email"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} data-testid="button-back">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  {t('memorial.back')}
                </Button>
              )}
              <div className="ml-auto">
                {step < 3 ? (
                  <Button onClick={handleNext} disabled={loading} data-testid="button-next">
                    {t('memorial.next')}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={loading} data-testid="button-finish">
                    {loading ? 'Salvando...' : t('memorial.finish')}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default CreateMemorial;
