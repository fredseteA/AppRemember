import { useTranslation } from 'react-i18next';
import { PageHero, ContentSection, H2, P, Li, Ul, Divider, sharedStyles } from './InstitutionalComponents';

export default function TermsAndConditionsPage() {
  const { t } = useTranslation();
  const s2Items = t('institutional.terms.s2Items', { returnObjects: true });
  const s4Items = t('institutional.terms.s4Items', { returnObjects: true });

  return (
    <div style={{ background: 'linear-gradient(180deg, #c8e8f5 0%, #eef8fb 100%)', minHeight: '100vh', fontFamily: '"Georgia", serif' }}>
      <style>{sharedStyles}</style>

      <PageHero
        tag={t('institutional.terms.heroTag')}
        title={t('institutional.terms.heroTitle')}
        subtitle={t('institutional.terms.heroSubtitle')}
      />

      <ContentSection>

        <H2>{t('institutional.terms.s1Title')}</H2>
        <P>{t('institutional.terms.s1')}</P>

        <Divider />
        <H2>{t('institutional.terms.s2Title')}</H2>
        <P>{t('institutional.terms.s2Intro')}</P>
        <Ul>
          {Array.isArray(s2Items) && s2Items.map((item, i) => (
            <Li key={i}>{item}</Li>
          ))}
        </Ul>

        <Divider />
        <H2>{t('institutional.terms.s3Title')}</H2>
        <P>{t('institutional.terms.s3a')}</P>
        <P>{t('institutional.terms.s3b')}</P>

        <Divider />
        <H2>{t('institutional.terms.s4Title')}</H2>
        <P>{t('institutional.terms.s4Intro')}</P>
        <Ul>
          {Array.isArray(s4Items) && s4Items.map((item, i) => (
            <Li key={i}>{item}</Li>
          ))}
        </Ul>
        <P>{t('institutional.terms.s4Footer')}</P>

        <Divider />
        <H2>{t('institutional.terms.s5Title')}</H2>
        <P>{t('institutional.terms.s5a')}</P>
        <P>{t('institutional.terms.s5b')}</P>

        <Divider />
        <H2>{t('institutional.terms.s6Title')}</H2>
        <P>{t('institutional.terms.s6a')}</P>
        <P>{t('institutional.terms.s6b')}</P>

        <Divider />
        <H2>{t('institutional.terms.s7Title')}</H2>
        <P>{t('institutional.terms.s7')}</P>

        <Divider />
        <H2>{t('institutional.terms.s8Title')}</H2>
        <P>{t('institutional.terms.s8a')}</P>
        <P>{t('institutional.terms.s8b')}</P>

        <Divider />
        <H2>{t('institutional.terms.s9Title')}</H2>
        <P>{t('institutional.terms.s9')}</P>

        <Divider />
        <H2>{t('institutional.terms.s10Title')}</H2>
        <P>{t('institutional.terms.s10')}</P>

        <Divider />
        <H2>{t('institutional.terms.s11Title')}</H2>
        <P>{t('institutional.terms.s11')}</P>

        <Divider />
        <H2>{t('institutional.terms.s12Title')}</H2>
        <P>{t('institutional.terms.s12a')}</P>
        <P style={{ color: '#7a9bb5', fontSize: '0.82rem' }}>{t('institutional.terms.s12Date')}</P>

      </ContentSection>
    </div>
  );
}