import React from 'react';

import { useTS } from '@jetbrains/kotlin-web-site-ui/out/components/breakpoints';
import '@jetbrains/kotlin-web-site-ui/out/components/layout';

import { Layout } from '../components/layout/layout';

import { ThemeProvider } from '@rescui/ui-contexts';

import GlobalHeader from '@jetbrains/kotlin-web-site-ui/out/components/header';
import GlobalFooter from '@jetbrains/kotlin-web-site-ui/out/components/footer';

import { StickyHeader } from '../components/sticky-header/sticky-header';

import releasesDataRaw from '../data/releases.yml';

const releasesData: ReleasesData = releasesDataRaw as ReleasesData;

import searchConfig from '../search-config.json';

import { NotFoundContent } from '../blocks/404';

function NotFoundPage() {
    const isTS = useTS();

    return (
        <Layout
            title={'Kotlin Programming Language'}
            ogImageName={'general.png'}
            description={
                'Kotlin is a concise and multiplatform programming language by JetBrains. Enjoy coding and build server-side, mobile, web, and desktop applications efficiently.'
            }
        >
            <StickyHeader>
                <GlobalHeader
                    productWebUrl={releasesData.latest.url}
                    hasSearch={true}
                    searchConfig={searchConfig}
                    darkHeader
                />
            </StickyHeader>

            <NotFoundContent />

            <ThemeProvider theme={'dark'}>
                <GlobalFooter />
            </ThemeProvider>
        </Layout>
    );
}

export default NotFoundPage;
