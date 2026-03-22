import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const FLAGS = {
  pt: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 22" width="28" height="20" fill="none">
      <g style={{ transformOrigin: '0px 11px', animation: 'subtleWave 3s ease-in-out infinite' }}>
        <style>{`
          @keyframes subtleWave {
            0%,100% { transform: skewY(0deg) scaleX(1); }
            30%      { transform: skewY(1.2deg) scaleX(0.98); }
            60%      { transform: skewY(-0.8deg) scaleX(1.01); }
          }
        `}</style>
        <rect x="1" y="1" width="30" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <polygon points="16,3.5 28,11 16,18.5 4,11" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <circle cx="16" cy="11" r="4.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M11.8,8.5 Q16,7 20.2,8.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      </g>
    </svg>
  ),
  en: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 22" width="28" height="20" fill="none">
      <g style={{ transformOrigin: '0px 11px', animation: 'subtleWave 3s ease-in-out infinite' }}>
        <rect x="1" y="1" width="30" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="1" y="1" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
        <line x1="1"  y1="5"  x2="31" y2="5"  stroke="currentColor" strokeWidth="0.9" strokeDasharray="2 1"/>
        <line x1="1"  y1="8"  x2="31" y2="8"  stroke="currentColor" strokeWidth="0.9" strokeDasharray="2 1"/>
        <line x1="13" y1="11" x2="31" y2="11" stroke="currentColor" strokeWidth="0.9" strokeDasharray="2 1"/>
        <line x1="1"  y1="14" x2="31" y2="14" stroke="currentColor" strokeWidth="0.9" strokeDasharray="2 1"/>
        <line x1="1"  y1="17" x2="31" y2="17" stroke="currentColor" strokeWidth="0.9" strokeDasharray="2 1"/>
        <circle cx="4"  cy="3.5" r="0.7" fill="currentColor"/>
        <circle cx="7"  cy="3.5" r="0.7" fill="currentColor"/>
        <circle cx="10" cy="3.5" r="0.7" fill="currentColor"/>
        <circle cx="4"  cy="6.5" r="0.7" fill="currentColor"/>
        <circle cx="7"  cy="6.5" r="0.7" fill="currentColor"/>
        <circle cx="10" cy="6.5" r="0.7" fill="currentColor"/>
        <circle cx="4"  cy="9.5" r="0.7" fill="currentColor"/>
        <circle cx="7"  cy="9.5" r="0.7" fill="currentColor"/>
        <circle cx="10" cy="9.5" r="0.7" fill="currentColor"/>
      </g>
    </svg>
  ),
};
const resources = {
  pt: {
    translation: {

      // ── Navbar ──────────────────────────────────────────────────────────────
      nav: {
        home: 'Início',
        howItWorks: 'Como Funciona',
        whyPreserve: 'Por que preservar?',
        explore: 'Explorar',
        createMemorial: 'Criar Memorial',
        login: 'Entrar',
        myAccount: 'Minha Conta',
        myMemorials: 'Meus Memoriais',
        myPurchases: 'Minhas Compras',
        support: 'Suporte',
        admin: 'Admin',
        logout: 'Sair',
        supporterPanel: 'Painel do affiliate',
        myAccountSection: 'Minha conta',
        closeMenu: 'Fechar menu',
        openMenu: 'Abrir menu',
        toggleLanguage: 'Trocar idioma',
      },

      // ── Auth ─────────────────────────────────────────────────────────────────
      auth: {
        signIn: 'Entrar',
        signUp: 'Cadastrar',
        email: 'Email',
        password: 'Senha',
        name: 'Nome',
        continueWithGoogle: 'Continuar com Google',
        alreadyHaveAccount: 'Já tem uma conta?',
        dontHaveAccount: 'Não tem uma conta?',
      },

      // ── Home — Hero ──────────────────────────────────────────────────────────
      hero: {
        title: 'Transforme lembranças\nem homenagens.',
        description: 'Mantenha as histórias de quem você ama vivas, acessível a qualquer momento, de qualquer lugar.',
        cta: 'Criar memorial gratuito',
        ctaSecondary: 'Por que preservar memórias?',
      },

      // ── Home — Como Funciona ─────────────────────────────────────────────────
      howItWorks: {
        eyebrow: 'Como Funciona',
        title: 'Em apenas 3 passos simples,\ncrie uma homenagem eterna.',
        description: 'Do início ao memorial publicado, tudo pensado para ser simples, bonito e significativo.',
        footer: '✨ Criar o memorial é gratuito · Você só paga se quiser publicar',
        step: 'Passo',
        steps: [
          {
            num: '01',
            label: 'Crie o memorial',
            title: 'Crie o memorial',
            subtitle: 'Como preencher?',
            description: 'Preencha as informações da homenagem: dados pessoais, uma frase especial, biografia, fotos e até um áudio. Tudo de forma simples e carinhosa.',
            cta: 'Começar agora',
          },
          {
            num: '02',
            label: 'Veja o resultado',
            title: 'Veja o resultado',
            subtitle: 'Como fica o memorial?',
            description: 'O memorial é exibido pronto na tela para você ver como ficou. Ele fica salvo no seu perfil, pronto para ser publicado quando você decidir.',
            cta: 'Ver exemplo',
          },
          {
            num: '03',
            label: 'Escolha um plano',
            title: 'Escolha um plano',
            subtitle: 'Como publicar?',
            description: 'Se gostar do resultado, escolha um plano para publicar o memorial online e/ou receber a placa física com QR Code para o túmulo.',
            cta: 'Ver planos',
          },
        ],
      },

      // ── Home — Planos ────────────────────────────────────────────────────────
      plans: {
        eyebrow: 'Planos',
        title: 'Escolha seu Plano',
        description: 'Duas opções para eternizar a memória de quem você ama',
        choosePlan: 'ESCOLHER PLANO',
        digital: 'Plano Digital',
        digitalPrice: 'R$ 29,90',
        digitalDesc: 'Memorial digital publicado na plataforma',
        digitalFeatures: [
          'Memorial digital completo',
          'Galeria de até 10 fotos',
          'Áudio de homenagem',
          'QR Code digital',
        ],
        plaque: 'Plano Placa QR Code',
        plaquePrice: 'R$ 149,90',
        plaqueDesc: 'Memorial + Placa física de aço inox',
        plaqueFeatures: [
          'Tudo do Plano Digital',
          'Placa física em aço inox',
          'QR Code gravado permanente',
          'Envio para todo Brasil',
        ],
        mostPopular: 'Mais Popular',
        complete: 'Plano Completo',
        completeDesc: 'Memorial + Placa física',
        editFee: 'Taxa de edição futura',
        paymentSafe: 'Pagamento seguro via',
      },

      // ── Home — Product Showcase ──────────────────────────────────────────────
      showcase: {
        eyebrow: 'Produto físico',
        title: 'Veja como sua homenagem\nganha vida',
        description: 'Após contar a história do seu ente querido, criamos uma homenagem física única — feita com cuidado para eternizar memórias.',
        badge1: 'Aço inox gravado',
        badge2: 'QR Code',
        mainLabel: 'Foto do produto final',
        card1: 'Detalhe do acabamento',
        card2: 'Como ele chega embalado',
        card3: 'Exemplo de homenagem pronta',
        benefit1Title: 'Produzido com cuidado e respeito',
        benefit1Desc: 'Cada peça é feita com atenção ao detalhe e ao que ela representa.',
        benefit2Title: 'Material de alta qualidade',
        benefit2Desc: 'Aço inox resistente ao tempo, preservando a memória por décadas.',
        benefit3Title: 'Uma lembrança eterna para a família',
        benefit3Desc: 'Um ponto de encontro físico para homenagear e lembrar quem partiu.',
        cta: 'Começar minha homenagem',
        ctaFooter: '✨ Criar é gratuito · Você só paga ao publicar',
        imgSoon: 'Foto do produto real em breve',
        imgInsert: 'Inserir foto aqui',
      },

      // ── Home — Trust Badges ──────────────────────────────────────────────────
      trust: {
        secure: 'Site Seguro',
        payment: 'Compra pelo Mercado Pago',
        delivery: 'Entrega Rastreável',
      },

      // ── Home — FAQ ───────────────────────────────────────────────────────────
      faq: {
        eyebrow: 'FAQ',
        title: 'Todas as respostas.',
        description: 'Tem uma dúvida? A resposta está aqui.',
        items: [
          {
            q: 'Como funciona o QR Code?',
            a: 'O QR Code é gravado em uma placa de aço inox durável. Quando escaneado com um smartphone, ele direciona automaticamente para o memorial digital da pessoa homenageada.',
          },
          {
            q: 'O memorial fica disponível para sempre?',
            a: 'Sim! Após a criação e pagamento, seu memorial fica hospedado permanentemente em nossa plataforma, acessível 24/7 de qualquer lugar do mundo.',
          },
          {
            q: 'Posso editar o memorial depois de criado?',
            a: "Sim! Após adquirir um plano, você pode editar seu documento gratuitamente e a qualquer momento. Basta acessar a página 'Meus Memoriais' e clicar no botão de edição disponível no card do memorial.",
          },
          {
            q: 'Quanto tempo demora a entrega da placa?',
            a: 'A produção e envio levam de 7 a 15 dias úteis. Você receberá código de rastreamento assim que o pedido for despachado.',
          },
          {
            q: 'A placa resiste às condições do tempo?',
            a: 'Sim! Nossa placa é feita em aço inox de alta qualidade, resistente à chuva, sol e variações de temperatura, garantindo durabilidade por muitos anos.',
          },
        ],
      },

      // ── Home — Depoimentos ───────────────────────────────────────────────────
      testimonials: {
        eyebrow: 'Avaliações',
        title: 'O que nossos clientes dizem',
        close: 'Fechar',
        review: 'Avaliar',
        client: 'Cliente',
        prev: 'Anterior',
        next: 'Próximo',
        review_n: 'Avaliação {{n}}',
      },

      // ── Home — Why Choose Us ─────────────────────────────────────────────────
      why: {
        eyebrow: 'Por que nos escolher',
        title: 'Por que a\nRemember QRCode.',
        description: 'Escolha quem entende a importância de preservar memórias. Oferecemos uma tecnologia única de QR Codes personalizados, que conecta o presente ao passado de forma significativa.',
        cta: 'Sobre a Remember QRCode',
      },

      // ── Memorial ─────────────────────────────────────────────────────────────
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
        selectPlan: 'Selecionar Plano',
      },

      // ── Footer ───────────────────────────────────────────────────────────────
      footer: {
        tagline: 'Memoriais digitais para preservar histórias e homenagear vidas.',
        followUs: 'Siga-nos',
        colProduct: 'Produto',
        colCompany: 'Empresa',
        colSupport: 'Suporte',
        colGuarantees: 'Garantias',
        emailLabel: 'E-mail',
        chatLabel: 'Chat',
        chatLink: 'Falar no WhatsApp',
        guarantee1: 'Compra Segura',
        guarantee2: 'Entrega Rastreável',
        guarantee3: 'Suporte Dedicado',
        copyright: '© {{year}} Remember QRCode · Todos os direitos reservados.',
        about: 'Sobre a Remember QRCode',
        responsibility: 'Política de Responsabilidade',
        privacy: 'Política de Privacidade',
        returns: 'Troca, Devolução e Reembolso',
        terms: 'Termos e Condições',
        delivery: 'Política de Entrega',
        aboutShort: 'Sobre nós',
        privacyShort: 'Privacidade',
        cancellation: 'Cancelamento e Reembolso',
      },

      // ── Security Badge ───────────────────────────────────────────────────────
      security: {
        redirectMessage: 'Você será redirecionado para o pagamento seguro via',
        paymentSafe: 'Pagamento seguro via',
        secureEnv: 'Ambiente seguro',
        ssl: 'SSL 256-bit',
        paymentVia: 'Pagamento via',
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  en: {
    translation: {

      nav: {
        home: 'Home',
        howItWorks: 'How It Works',
        whyPreserve: 'Why preserve?',
        explore: 'Explore',
        createMemorial: 'Create Memorial',
        login: 'Login',
        myAccount: 'My Account',
        myMemorials: 'My Memorials',
        myPurchases: 'My Purchases',
        support: 'Support',
        admin: 'Admin',
        logout: 'Logout',
        supporterPanel: 'Supporter Panel',
        myAccountSection: 'My account',
        closeMenu: 'Close menu',
        openMenu: 'Open menu',
        toggleLanguage: 'Toggle language',
      },

      auth: {
        signIn: 'Sign In',
        signUp: 'Sign Up',
        email: 'Email',
        password: 'Password',
        name: 'Name',
        continueWithGoogle: 'Continue with Google',
        alreadyHaveAccount: 'Already have an account?',
        dontHaveAccount: "Don't have an account?",
      },

      hero: {
        title: 'Turn memories\ninto tributes.',
        description: 'Keep the stories of those you love alive, accessible at any time, from anywhere.',
        cta: 'Create free memorial',
        ctaSecondary: 'Why preserve memories?',
      },

      howItWorks: {
        eyebrow: 'How It Works',
        title: 'In just 3 simple steps,\ncreate an eternal tribute.',
        description: 'From start to published memorial, everything designed to be simple, beautiful and meaningful.',
        footer: '✨ Creating the memorial is free · You only pay if you want to publish',
        step: 'Step',
        steps: [
          {
            num: '01',
            label: 'Create the memorial',
            title: 'Create the memorial',
            subtitle: 'How to fill it in?',
            description: 'Fill in the tribute information: personal details, a special phrase, biography, photos and even audio. All in a simple and caring way.',
            cta: 'Start now',
          },
          {
            num: '02',
            label: 'See the result',
            title: 'See the result',
            subtitle: 'What does the memorial look like?',
            description: 'The memorial is displayed ready on screen for you to see how it turned out. It is saved in your profile, ready to be published when you decide.',
            cta: 'See example',
          },
          {
            num: '03',
            label: 'Choose a plan',
            title: 'Choose a plan',
            subtitle: 'How to publish?',
            description: 'If you like the result, choose a plan to publish the memorial online and/or receive the physical QR Code plaque for the graveside.',
            cta: 'See plans',
          },
        ],
      },

      plans: {
        eyebrow: 'Plans',
        title: 'Choose Your Plan',
        description: 'Two options to eternalize the memory of those you love',
        choosePlan: 'CHOOSE PLAN',
        digital: 'Digital Plan',
        digitalPrice: 'R$ 29.90',
        digitalDesc: 'Digital memorial published on the platform',
        digitalFeatures: [
          'Complete digital memorial',
          'Gallery of up to 10 photos',
          'Tribute audio',
          'Digital QR Code',
        ],
        plaque: 'QR Code Plaque Plan',
        plaquePrice: 'R$ 149.90',
        plaqueDesc: 'Memorial + Physical stainless steel plaque',
        plaqueFeatures: [
          'Everything in the Digital Plan',
          'Physical stainless steel plaque',
          'Permanently engraved QR Code',
          'Shipping across Brazil',
        ],
        mostPopular: 'Most Popular',
        complete: 'Complete Plan',
        completeDesc: 'Memorial + Physical Plaque',
        editFee: 'Future edit fee',
        paymentSafe: 'Secure payment via',
      },

      showcase: {
        eyebrow: 'Physical product',
        title: 'See how your tribute\ncomes to life',
        description: 'After telling the story of your loved one, we create a unique physical tribute — crafted with care to eternalize memories.',
        badge1: 'Engraved stainless steel',
        badge2: 'QR Code',
        mainLabel: 'Final product photo',
        card1: 'Finish detail',
        card2: 'How it arrives packaged',
        card3: 'Example of finished tribute',
        benefit1Title: 'Made with care and respect',
        benefit1Desc: 'Each piece is made with attention to detail and what it represents.',
        benefit2Title: 'High quality material',
        benefit2Desc: 'Stainless steel resistant to time, preserving the memory for decades.',
        benefit3Title: 'An eternal keepsake for the family',
        benefit3Desc: 'A physical gathering point to honor and remember those who passed.',
        cta: 'Start my tribute',
        ctaFooter: '✨ Creating is free · You only pay when publishing',
        imgSoon: 'Real product photo coming soon',
        imgInsert: 'Insert photo here',
      },

      trust: {
        secure: 'Secure Site',
        payment: 'Payment via Mercado Pago',
        delivery: 'Trackable Delivery',
      },

      faq: {
        eyebrow: 'FAQ',
        title: 'All the answers.',
        description: 'Have a question? The answer is here.',
        items: [
          {
            q: 'How does the QR Code work?',
            a: 'The QR Code is engraved on a durable stainless steel plaque. When scanned with a smartphone, it automatically directs to the digital memorial of the honored person.',
          },
          {
            q: 'Is the memorial available forever?',
            a: 'Yes! After creation and payment, your memorial is permanently hosted on our platform, accessible 24/7 from anywhere in the world.',
          },
          {
            q: 'Can I edit the memorial after it is created?',
            a: "Yes! After purchasing a plan, you can edit your memorial for free at any time. Just go to the 'My Memorials' page and click the edit button on the memorial card.",
          },
          {
            q: 'How long does plaque delivery take?',
            a: 'Production and shipping take 7 to 15 business days. You will receive a tracking code as soon as the order is dispatched.',
          },
          {
            q: 'Does the plaque withstand weather conditions?',
            a: 'Yes! Our plaque is made of high-quality stainless steel, resistant to rain, sun, and temperature changes, ensuring durability for many years.',
          },
        ],
      },

      testimonials: {
        eyebrow: 'Reviews',
        title: 'What our customers say',
        close: 'Close',
        review: 'Review',
        client: 'Customer',
        prev: 'Previous',
        next: 'Next',
        review_n: 'Review {{n}}',
      },

      why: {
        eyebrow: 'Why choose us',
        title: 'Why\nRemember QRCode.',
        description: 'Choose those who understand the importance of preserving memories. We offer a unique QR Code technology that connects the present to the past in a meaningful way.',
        cta: 'About Remember QRCode',
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
        selectPlan: 'Select Plan',
      },

      footer: {
        tagline: 'Digital memorials to preserve stories and honor lives.',
        followUs: 'Follow us',
        colProduct: 'Product',
        colCompany: 'Company',
        colSupport: 'Support',
        colGuarantees: 'Guarantees',
        emailLabel: 'Email',
        chatLabel: 'Chat',
        chatLink: 'Chat on WhatsApp',
        guarantee1: 'Secure Purchase',
        guarantee2: 'Trackable Delivery',
        guarantee3: 'Dedicated Support',
        copyright: '© {{year}} Remember QRCode · All rights reserved.',
        about: 'About Remember QRCode',
        responsibility: 'Responsibility Policy',
        privacy: 'Privacy Policy',
        returns: 'Exchanges, Returns & Refunds',
        terms: 'Terms and Conditions',
        delivery: 'Delivery Policy',
        aboutShort: 'About us',
        privacyShort: 'Privacy',
        cancellation: 'Cancellation & Refund',
      },

      security: {
        redirectMessage: 'You will be redirected to secure payment via',
        paymentSafe: 'Secure payment via',
        secureEnv: 'Secure environment',
        ssl: 'SSL 256-bit',
        paymentVia: 'Payment via',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt',
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;