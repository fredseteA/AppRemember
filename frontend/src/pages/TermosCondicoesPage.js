import { PageHero, ContentSection, H2, P, Li, Ul, Divider, sharedStyles } from './InstComponents';

export default function TermosCondicoesPage() {
  return (
    <div style={{ background: 'linear-gradient(180deg, #c8e8f5 0%, #eef8fb 100%)', minHeight: '100vh', fontFamily: '"Georgia", serif' }}>
      <style>{sharedStyles}</style>

      <PageHero
        tag="Legal"
        title="Termos e Condições"
        subtitle="Leia com atenção as condições de uso da plataforma Remember QRCode antes de utilizar nossos serviços."
      />

      <ContentSection>

        <H2>1. Aceitação dos termos</H2>
        <P>
          Ao criar uma conta, utilizar a plataforma ou adquirir qualquer produto ou serviço da Remember QRCode, o usuário declara que leu, compreendeu e concorda com os presentes Termos e Condições de Uso. Caso não concorde com qualquer disposição, recomendamos que não utilize a plataforma.
        </P>

        <Divider />
        <H2>2. Descrição dos serviços</H2>
        <P>A Remember QRCode oferece:</P>
        <Ul>
          <Li>Criação gratuita de memoriais digitais em formato de rascunho.</Li>
          <Li>Publicação oficial do memorial online mediante contratação do Plano Digital.</Li>
          <Li>Produção e entrega de placa física em aço inoxidável com QR Code, mediante contratação do Plano Placa QR Code.</Li>
        </Ul>

        <Divider />
        <H2>3. Cadastro e conta do usuário</H2>
        <P>
          Para utilizar a plataforma, é necessário criar uma conta com informações verdadeiras e atualizadas. O usuário é responsável pela confidencialidade de sua senha e por todas as atividades realizadas em sua conta.
        </P>
        <P>
          A Remember QRCode reserva-se o direito de suspender ou excluir contas que violem estes termos, contenham informações falsas ou apresentem comportamento abusivo na plataforma.
        </P>

        <Divider />
        <H2>4. Conteúdo dos memoriais</H2>
        <P>
          O usuário é integralmente responsável pelo conteúdo inserido nos memoriais. É expressamente proibido publicar conteúdo que:
        </P>
        <Ul>
          <Li>Seja falso, enganoso ou difamatório.</Li>
          <Li>Viole direitos autorais, de imagem ou de privacidade de terceiros.</Li>
          <Li>Contenha material ofensivo, discriminatório, violento ou ilegal.</Li>
          <Li>Faça referência a pessoas vivas sem autorização explícita.</Li>
        </Ul>
        <P>
          A Remember QRCode poderá remover qualquer conteúdo que viole estas diretrizes, sem aviso prévio e sem direito a reembolso.
        </P>

        <Divider />
        <H2>5. Pagamentos e planos</H2>
        <P>
          Os valores dos planos são os vigentes no momento da contratação. O pagamento é processado por gateways certificados e seguros. Após a confirmação do pagamento, o pedido entra em processamento imediatamente.
        </P>
        <P>
          Não realizamos parcelamento fora das condições disponibilizadas pelo gateway de pagamento. Promoções e descontos (incluindo os gerados por códigos de apoiadores) não são cumulativos.
        </P>

        <Divider />
        <H2>6. Prazo de entrega</H2>
        <P>
          O prazo de produção e entrega da placa física é de 7 a 15 dias úteis após a confirmação do pagamento. O cliente receberá o código de rastreamento por e-mail assim que o pedido for despachado.
        </P>
        <P>
          Atrasos causados por transportadoras, greves, desastres naturais ou outros eventos fora do controle da empresa não geram direito a reembolso automático, mas serão comunicados ao cliente.
        </P>

        <Divider />
        <H2>7. Disponibilidade do memorial digital</H2>
        <P>
          Os memoriais publicados ficam disponíveis permanentemente na plataforma, salvo nos casos de violação destes termos ou solicitação expressa do titular da conta. A Remember QRCode empreenderá todos os esforços razoáveis para manter a plataforma disponível 24 horas por dia, 7 dias por semana.
        </P>

        <Divider />
        <H2>8. Programa de apoiadores</H2>
        <P>
          Funerárias, cemitérios e outros parceiros podem participar do programa de apoiadores mediante adesão formal. O parceiro recebe um código exclusivo que gera desconto para clientes e comissão progressiva (10%, 15% ou 20%) sobre as vendas realizadas com o código.
        </P>
        <P>
          As comissões são calculadas mensalmente e pagas conforme acordado no contrato de parceria. A Remember QRCode reserva-se o direito de encerrar parcerias que violem os princípios éticos da plataforma.
        </P>

        <Divider />
        <H2>9. Propriedade intelectual</H2>
        <P>
          Todo o conteúdo da plataforma — marca, logotipo, design, textos institucionais e código — é de propriedade exclusiva da Remember QRCode e protegido por lei. É proibida a reprodução, cópia ou uso não autorizado de qualquer elemento da plataforma.
        </P>

        <Divider />
        <H2>10. Limitação de responsabilidade</H2>
        <P>
          A Remember QRCode não se responsabiliza por danos indiretos, lucros cessantes ou prejuízos decorrentes do uso da plataforma, exceto nos casos expressamente previstos em lei. Nossa responsabilidade está limitada ao valor pago pelo cliente no serviço contratado.
        </P>

        <Divider />
        <H2>11. Alterações nos termos</H2>
        <P>
          Estes Termos e Condições podem ser atualizados a qualquer momento. Os usuários cadastrados serão notificados por e-mail em caso de alterações relevantes. O uso continuado da plataforma após a notificação implica aceitação dos novos termos.
        </P>

        <Divider />
        <H2>12. Foro e legislação aplicável</H2>
        <P>
          Estes termos são regidos pela legislação brasileira. Em caso de conflito, as partes elegem o foro da comarca do domicílio do consumidor, conforme previsto no Código de Defesa do Consumidor.
        </P>
        <P style={{ color: '#7a9bb5', fontSize: '0.82rem' }}>Última atualização: junho de 2025.</P>

      </ContentSection>
    </div>
  );
}
