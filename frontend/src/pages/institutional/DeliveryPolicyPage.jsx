import { PageHero, ContentSection, H2, P, Li, Ul, Divider, sharedStyles } from './InstitutionalComponents';

export default function DeliveryPolicyPage() {
  return (
    <div style={{ background: 'linear-gradient(180deg, #c8e8f5 0%, #a8d8f0 18%, #7bbde8 32%, #b8e0f5 55%, #eef8fb 100%)', minHeight: '100vh', fontFamily: '"Georgia", serif' }}>
      <style>{sharedStyles}</style>

      <PageHero
        tag="Entrega"
        title="Política de Entrega"
        subtitle="Saiba tudo sobre os prazos, formas de envio e acompanhamento do seu pedido."
      />

      <ContentSection>

        <H2>1. Abrangência da entrega</H2>
        <P>
          A Remember QRCode realiza entregas para todo o território nacional. O envio da placa física é feito exclusivamente após a confirmação do pagamento e a aprovação do memorial pelo cliente.
        </P>

        <Divider />
        <H2>2. Prazo de produção e envio</H2>
        <P>
          Após a confirmação do pagamento, o pedido segue as seguintes etapas:
        </P>
        <Ul>
          <Li><strong>Produção da placa:</strong> até 5 dias úteis.</Li>
          <Li><strong>Despacho para transportadora:</strong> em até 2 dias úteis após a finalização.</Li>
          <Li><strong>Entrega ao destinatário:</strong> de 3 a 8 dias úteis após o despacho, conforme a região.</Li>
        </Ul>
        <P>
          O prazo total estimado é de <strong>7 a 15 dias úteis</strong> a partir da confirmação do pagamento. Regiões mais remotas podem apresentar prazos superiores.
        </P>

        <Divider />
        <H2>3. Rastreamento do pedido</H2>
        <P>
          Assim que o pedido for despachado, o cliente receberá um e-mail com o código de rastreamento e o link para acompanhar a entrega diretamente no site da transportadora.
        </P>
        <P>
          Todas as atualizações de status também são enviadas por e-mail ao longo do processo:
        </P>
        <Ul>
          <Li>Memorial criado e pagamento confirmado.</Li>
          <Li>Pedido em produção.</Li>
          <Li>Produto finalizado e em preparação para envio.</Li>
          <Li>Pedido despachado (com código de rastreamento).</Li>
          <Li>Pedido entregue.</Li>
        </Ul>

        <Divider />
        <H2>4. Frete</H2>
        <P>
          O valor do frete é calculado automaticamente no momento da compra, com base no CEP de entrega informado pelo cliente. O valor é exibido de forma clara antes da finalização do pedido.
        </P>

        <Divider />
        <H2>5. Endereço de entrega</H2>
        <P>
          O cliente é responsável por informar corretamente o endereço de entrega. Em caso de endereço incorreto ou incompleto, a Remember QRCode não se responsabiliza por atrasos ou não entrega.
        </P>
        <P>
          Caso seja necessário corrigir o endereço após a confirmação do pedido, entre em contato imediatamente com nossa equipe pelo WhatsApp ou e-mail. Só é possível realizar a alteração se o pedido ainda não tiver sido despachado.
        </P>

        <Divider />
        <H2>6. Tentativa de entrega</H2>
        <P>
          A transportadora realizará até 3 tentativas de entrega no endereço informado. Caso não haja ninguém para receber, o cliente será orientado a retirar o objeto em um ponto de coleta próximo, conforme as diretrizes da transportadora.
        </P>
        <P>
          Após o prazo de guarda no ponto de coleta, o objeto pode ser devolvido ao remetente. Nesse caso, um novo envio poderá ser realizado mediante pagamento de novo frete.
        </P>

        <Divider />
        <H2>7. Avaria ou extravio</H2>
        <P>
          Em caso de avaria ou extravio durante o transporte, o cliente deve entrar em contato com nossa equipe em até <strong>7 dias após a data de entrega prevista</strong>, apresentando fotos do produto recebido (se houver avaria) ou informando a ausência de entrega.
        </P>
        <P>
          Após análise, providenciaremos a produção e reenvio de uma nova placa sem custo adicional ao cliente.
        </P>

        <Divider />
        <H2>8. Dúvidas sobre entrega</H2>
        <P>
          Para qualquer dúvida relacionada ao envio do seu pedido, entre em contato com nossa equipe pelo WhatsApp (+55 22 99208-0811) ou e-mail (rememberqrcode@gmail.com). Respondemos em até 1 dia útil.
        </P>

      </ContentSection>
    </div>
  );
}