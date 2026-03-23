import { useTranslation } from 'react-i18next';
import { PageHero, ContentSection, H2, P, Li, Ul, Divider, sharedStyles } from './InstitutionalComponents';

export default function DeliveryPolicyPage() {
  const { t } = useTranslation();
  const s2Items = t('institutional.delivery.s2Items', { returnObjects: true });
  const s3Items = t('institutional.delivery.s3Items', { returnObjects: true });

  return (
    <div style={{ background: 'linear-gradient(180deg, #c8e8f5 0%, #a8d8f0 18%, #7bbde8 32%, #b8e0f5 55%, #eef8fb 100%)', minHeight: '100vh', fontFamily: '"Georgia", serif' }}>
      <style>{sharedStyles}</style>

      <PageHero
        tag={t('institutional.delivery.heroTag')}
        title={t('institutional.delivery.heroTitle')}
        subtitle={t('institutional.delivery.heroSubtitle')}
      />

      <ContentSection>

        <H2>{t('institutional.delivery.s1Title')}</H2>
        <P>{t('institutional.delivery.s1')}</P>

        <Divider />
        <H2>{t('institutional.delivery.s2Title')}</H2>
        <P>{t('institutional.delivery.s2Intro')}</P>
        <Ul>
          {Array.isArray(s2Items) && s2Items.map((item, i) => (
            <Li key={i}><span dangerouslySetInnerHTML={{ __html: item }} /></Li>
          ))}
        </Ul>
        <P dangerouslySetInnerHTML={{ __html: t('institutional.delivery.s2Footer') }} />

        <Divider />
        <H2>{t('institutional.delivery.s3Title')}</H2>
        <P>{t('institutional.delivery.s3a')}</P>
        <P>{t('institutional.delivery.s3b')}</P>
        <Ul>
          {Array.isArray(s3Items) && s3Items.map((item, i) => (
            <Li key={i}>{item}</Li>
          ))}
        </Ul>

        <Divider />
        <H2>{t('institutional.delivery.s4Title')}</H2>
        <P>{t('institutional.delivery.s4')}</P>

        <Divider />
        <H2>{t('institutional.delivery.s5Title')}</H2>
        <P>{t('institutional.delivery.s5a')}</P>
        <P>{t('institutional.delivery.s5b')}</P>

        <Divider />
        <H2>{t('institutional.delivery.s6Title')}</H2>
        <P>{t('institutional.delivery.s6a')}</P>
        <P>{t('institutional.delivery.s6b')}</P>

        <Divider />
        <H2>{t('institutional.delivery.s7Title')}</H2>
        <P dangerouslySetInnerHTML={{ __html: t('institutional.delivery.s7a') }} />
        <P>{t('institutional.delivery.s7b')}</P>

        <Divider />
        <H2>{t('institutional.delivery.s8Title')}</H2>
        <P>{t('institutional.delivery.s8')}</P>

      </ContentSection>
    </div>
  );
}