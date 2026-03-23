import { useTranslation } from 'react-i18next';
import { PageHero, ContentSection, H2, P, Li, Ul, Divider, sharedStyles } from './InstitutionalComponents';

export default function ResponsibilityPolicyPage() {
  const { t } = useTranslation();
  const s2Items = t('institutional.responsibility.s2Items', { returnObjects: true });
  const s3Items = t('institutional.responsibility.s3Items', { returnObjects: true });

  return (
    <div style={{ background: 'linear-gradient(180deg, #c8e8f5 0%, #a8d8f0 18%, #7bbde8 32%, #b8e0f5 55%, #eef8fb 100%)', minHeight: '100vh', fontFamily: '"Georgia", serif' }}>
      <style>{sharedStyles}</style>

      <PageHero
        tag={t('institutional.responsibility.heroTag')}
        title={t('institutional.responsibility.heroTitle')}
        subtitle={t('institutional.responsibility.heroSubtitle')}
      />

      <ContentSection>

        <H2>{t('institutional.responsibility.s1Title')}</H2>
        <P>{t('institutional.responsibility.s1')}</P>

        <Divider />
        <H2>{t('institutional.responsibility.s2Title')}</H2>
        <P>{t('institutional.responsibility.s2a')}</P>
        <P>{t('institutional.responsibility.s2Intro')}</P>
        <Ul>
          {Array.isArray(s2Items) && s2Items.map((item, i) => (
            <Li key={i}>{item}</Li>
          ))}
        </Ul>
        <P>{t('institutional.responsibility.s2Footer')}</P>

        <Divider />
        <H2>{t('institutional.responsibility.s3Title')}</H2>
        <P>{t('institutional.responsibility.s3a')}</P>
        <P>{t('institutional.responsibility.s3Intro')}</P>
        <Ul>
          {Array.isArray(s3Items) && s3Items.map((item, i) => (
            <Li key={i}>{item}</Li>
          ))}
        </Ul>

        <Divider />
        <H2>{t('institutional.responsibility.s4Title')}</H2>
        <P>{t('institutional.responsibility.s4a')}</P>
        <P>{t('institutional.responsibility.s4b')}</P>

        <Divider />
        <H2>{t('institutional.responsibility.s5Title')}</H2>
        <P>{t('institutional.responsibility.s5')}</P>

        <Divider />
        <H2>{t('institutional.responsibility.s6Title')}</H2>
        <P>{t('institutional.responsibility.s6')}</P>

      </ContentSection>
    </div>
  );
}