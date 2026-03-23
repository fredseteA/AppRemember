import { useTranslation } from 'react-i18next';
import { PageHero, ContentSection, H2, P, Li, Ul, Divider, sharedStyles } from './InstitutionalComponents';

export default function ReturnPolicyPage() {
  const { t } = useTranslation();
  const s2Items = t('institutional.returns.s2Items', { returnObjects: true });
  const s3Items = t('institutional.returns.s3Items', { returnObjects: true });
  const s4Items = t('institutional.returns.s4Items', { returnObjects: true });
  const s5Items = t('institutional.returns.s5Items', { returnObjects: true });

  return (
    <div style={{ background: 'linear-gradient(180deg, #c8e8f5 0%, #a8d8f0 18%, #7bbde8 32%, #b8e0f5 55%, #eef8fb 100%)', minHeight: '100vh', fontFamily: '"Georgia", serif' }}>
      <style>{sharedStyles}</style>

      <PageHero
        tag={t('institutional.returns.heroTag')}
        title={t('institutional.returns.heroTitle')}
        subtitle={t('institutional.returns.heroSubtitle')}
      />

      <ContentSection>

        <H2>{t('institutional.returns.s1Title')}</H2>
        <P dangerouslySetInnerHTML={{ __html: t('institutional.returns.s1a') }} />
        <P>{t('institutional.returns.s1b')}</P>

        <Divider />
        <H2>{t('institutional.returns.s2Title')}</H2>
        <P>{t('institutional.returns.s2Intro')}</P>
        <Ul>
          {Array.isArray(s2Items) && s2Items.map((item, i) => (
            <Li key={i}>{item}</Li>
          ))}
        </Ul>
        <P>{t('institutional.returns.s2Footer')}</P>

        <Divider />
        <H2>{t('institutional.returns.s3Title')}</H2>
        <P dangerouslySetInnerHTML={{ __html: t('institutional.returns.s3Intro') }} />
        <Ul>
          {Array.isArray(s3Items) && s3Items.map((item, i) => (
            <Li key={i}><span dangerouslySetInnerHTML={{ __html: item }} /></Li>
          ))}
        </Ul>

        <Divider />
        <H2>{t('institutional.returns.s4Title')}</H2>
        <P dangerouslySetInnerHTML={{ __html: t('institutional.returns.s4Intro') }} />
        <Ul>
          {Array.isArray(s4Items) && s4Items.map((item, i) => (
            <Li key={i}>{item}</Li>
          ))}
        </Ul>
        <P>{t('institutional.returns.s4Footer')}</P>

        <Divider />
        <H2>{t('institutional.returns.s5Title')}</H2>
        <P>{t('institutional.returns.s5Intro')}</P>
        <Ul>
          {Array.isArray(s5Items) && s5Items.map((item, i) => (
            <Li key={i}>{item}</Li>
          ))}
        </Ul>

        <Divider />
        <H2>{t('institutional.returns.s6Title')}</H2>
        <P>{t('institutional.returns.s6')}</P>

        <Divider />
        <H2>{t('institutional.returns.s7Title')}</H2>
        <P>{t('institutional.returns.s7')}</P>

      </ContentSection>
    </div>
  );
}