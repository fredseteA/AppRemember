import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  pt: {
    translation: {
      nav: {
        home: 'Início',
        howItWorks: 'Como Funciona',
        explore: 'Explorar',
        createMemorial: 'Criar Memorial',
        login: 'Entrar',
        myAccount: 'Minha Conta',
        myMemorials: 'Meus Memoriais',
        myPurchases: 'Minhas Compras',
        support: 'Suporte',
        admin: 'Admin',
        logout: 'Sair'
      },
      hero: {
        title: 'Preserve Memórias',
        subtitle: 'Para Sempre',
        description: 'Crie memoriais digitais eternos com QR Code para homenagear quem você ama',
        cta: 'Criar Memorial'
      },
      plans: {
        digital: 'Plano Digital',
        plaque: 'Plano Placa QR Code',
        complete: 'Plano Completo',
        digitalDesc: 'Memorial digital publicado na plataforma',
        plaqueDesc: 'Placa de aço inox com QR Code',
        completeDesc: 'Memorial + Placa física',
        editFee: 'Taxa de edição futura'
      },
      auth: {
        signIn: 'Entrar',
        signUp: 'Cadastrar',
        email: 'Email',
        password: 'Senha',
        name: 'Nome',
        continueWithGoogle: 'Continuar com Google',
        alreadyHaveAccount: 'Já tem uma conta?',
        dontHaveAccount: 'Não tem uma conta?'
      },
      memorial: {
        createTitle: 'Criar Memorial',
        step1: 'Dados da Pessoa',
        step2: 'Conteúdo do Memorial',
        step3: 'Dados do Responsável',
        fullName: 'Nome Completo',
        relationship: 'Parentesco',
        birthCity: 'Cidade de Nascimento',
        birthState: 'Estado de Nascimento',
        deathCity: 'Cidade de Falecimento',
        deathState: 'Estado de Falecimento',
        photo: 'Foto Principal',
        publicMemorial: 'Exibir no explorar',
        mainPhrase: 'Frase Principal',
        biography: 'Biografia',
        gallery: 'Galeria de Fotos',
        audio: 'Áudio',
        responsibleName: 'Nome do Responsável',
        phone: 'Telefone',
        next: 'Próximo',
        back: 'Voltar',
        finish: 'Finalizar',
        selectPlan: 'Selecionar Plano'
      }
    }
  },
  en: {
    translation: {
      nav: {
        home: 'Home',
        howItWorks: 'How It Works',
        explore: 'Explore',
        createMemorial: 'Create Memorial',
        login: 'Login',
        myAccount: 'My Account',
        myMemorials: 'My Memorials',
        myPurchases: 'My Purchases',
        support: 'Support',
        admin: 'Admin',
        logout: 'Logout'
      },
      hero: {
        title: 'Preserve Memories',
        subtitle: 'Forever',
        description: 'Create eternal digital memorials with QR Code to honor those you love',
        cta: 'Create Memorial'
      },
      plans: {
        digital: 'Digital Plan',
        plaque: 'QR Code Plaque Plan',
        complete: 'Complete Plan',
        digitalDesc: 'Digital memorial published on the platform',
        plaqueDesc: 'Stainless steel plaque with QR Code',
        completeDesc: 'Memorial + Physical Plaque',
        editFee: 'Future edit fee'
      },
      auth: {
        signIn: 'Sign In',
        signUp: 'Sign Up',
        email: 'Email',
        password: 'Password',
        name: 'Name',
        continueWithGoogle: 'Continue with Google',
        alreadyHaveAccount: 'Already have an account?',
        dontHaveAccount: "Don't have an account?"
      },
      memorial: {
        createTitle: 'Create Memorial',
        step1: 'Person Data',
        step2: 'Memorial Content',
        step3: 'Responsible Data',
        fullName: 'Full Name',
        relationship: 'Relationship',
        birthCity: 'Birth City',
        birthState: 'Birth State',
        deathCity: 'Death City',
        deathState: 'Death State',
        photo: 'Main Photo',
        publicMemorial: 'Show in explore',
        mainPhrase: 'Main Phrase',
        biography: 'Biography',
        gallery: 'Photo Gallery',
        audio: 'Audio',
        responsibleName: 'Responsible Name',
        phone: 'Phone',
        next: 'Next',
        back: 'Back',
        finish: 'Finish',
        selectPlan: 'Select Plan'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt',
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;