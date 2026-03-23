import { useTranslation } from 'react-i18next';
import { PageHero, ContentSection, H2, P, Li, Ul, Divider, sharedStyles } from './InstitutionalComponents';

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();
  const s1Items = t('institutional.privacy.s1Items', { returnObjects: true });
  const s2Items = t('institutional.privacy.s2Items', { returnObjects: true });
  const s4Items = t('institutional.privacy.s4Items', { returnObjects: true });
  const s5Items = t('institutional.privacy.s5Items', { returnObjects: true });

  return (
    <div style={{ background: 'linear-gradient(180deg, #c8e8f5 0%, #a8d8f0 18%, #7bbde8 32%, #b8e0f5 55%, #eef8fb 100%)', minHeight: '100vh', fontFamily: '"Georgia", serif' }}>
      <style>{sharedStyles}</style>

      <PageHero
        tag={t('institutional.privacy.heroTag')}
        title={t('institutional.privacy.heroTitle')}
        subtitle={t('institutional.privacy.heroSubtitle')}
      />

      <ContentSection>

        <H2>{t('institutional.privacy.s1Title')}</H2>
        <P>{t('institutional.privacy.s1Intro')}</P>
        <Ul>
          {Array.isArray(s1Items) && s1Items.map((item, i) => (
            <Li key={i}><span dangerouslySetInnerHTML={{ __html: item }} /></Li>
          ))}
        </Ul>

        <Divider />
        <H2>{t('institutional.privacy.s2Title')}</H2>
        <P>{t('institutional.privacy.s2Intro')}</P>
        <Ul>
          {Array.isArray(s2Items) && s2Items.map((item, i) => (
            <Li key={i}>{item}</Li>
          ))}
        </Ul>
        <P dangerouslySetInnerHTML={{ __html: t('institutional.privacy.s2Footer') }} />

        <Divider />
        <H2>{t('institutional.privacy.s3Title')}</H2>
        <P>{t('institutional.privacy.s3a')}</P>
        <P>{t('institutional.privacy.s3b')}</P>

        <Divider />
        <H2>{t('institutional.privacy.s4Title')}</H2>
        <P>{t('institutional.privacy.s4Intro')}</P>
        <Ul>
          {Array.isArray(s4Items) && s4Items.map((item, i) => (
            <Li key={i}><span dangerouslySetInnerHTML={{ __html: item }} /></Li>
          ))}
        </Ul>

        <Divider />
        <H2>{t('institutional.privacy.s5Title')}</H2>
        <P>{t('institutional.privacy.s5Intro')}</P>
        <Ul>
          {Array.isArray(s5Items) && s5Items.map((item, i) => (
            <Li key={i}>{item}</Li>
          ))}
        </Ul>
        <P>{t('institutional.privacy.s5Footer')}</P>

        <Divider />
        <H2>{t('institutional.privacy.s6Title')}</H2>
        <P>{t('institutional.privacy.s6')}</P>

        <Divider />
        <H2>{t('institutional.privacy.s7Title')}</H2>
        <P>{t('institutional.privacy.s7')}</P>

        <Divider />
        <H2>{t('institutional.privacy.s8Title')}</H2>
        <P>{t('institutional.privacy.s8a')}</P>
        <P style={{ color: '#7a9bb5', fontSize: '0.82rem' }}>{t('institutional.privacy.s8Date')}</P>

      </ContentSection>
    </div>
  );
}