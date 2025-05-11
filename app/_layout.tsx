import '@/global.css';
import { Theme, ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform } from 'react-native';

import { Container } from '@/components/Container';
import { useColorScheme } from '@/hooks/use-color';
import { NAV_THEME } from '@/lib/constants';
import { AsyncProvider } from '@/providers/async-provider';

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const hasMounted = React.useRef(false);
  const { colorScheme, isDarkColorScheme, setColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === 'web') {
      document.documentElement.classList.add('bg-background');
    }
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  React.useEffect(() => {
    setColorScheme('dark');
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <AsyncProvider>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <StatusBar style="auto" backgroundColor={isDarkColorScheme ? '#000' : '#fff'} />
        <Container>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(home)" />
            <Stack.Screen name="details" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </Container>
      </ThemeProvider>
      <PortalHost />
    </AsyncProvider>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === 'web' && typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;
