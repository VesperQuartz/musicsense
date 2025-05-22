/* eslint-disable no-void */
import { useSSO } from '@clerk/clerk-expo';
import * as AuthSession from 'expo-auth-session';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { Music } from 'lucide-react-native';
import React from 'react';
import { View, StyleSheet } from 'react-native';

import AuthButton from '@/components/auth-button';
import { Text } from '@/components/ui/text';
import MusicWaveAnimation from '@/components/wavy';

WebBrowser.maybeCompleteAuthSession();

export const useWarmUp = () => {
  React.useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

const SignInPage = () => {
  useWarmUp();
  const { startSSOFlow } = useSSO();

  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri({
          path: '/',
          scheme: 'musicsense',
        }),
      });
      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
      } else {
      }
    } catch (error) {
      console.error(JSON.stringify(error, null, 2));
    }
  };

  return (
    <>
      <LinearGradient colors={['#121212', '#1E1E1E', '#0C0C25']} style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <Music color="#6C63FF" size={48} />
            <Text style={styles.logoText}>Musicsense</Text>
          </View>

          <Text style={styles.title}>Your music journey starts here</Text>
          <Text style={styles.subtitle}>Sign in to access your personalized music experience</Text>

          <MusicWaveAnimation />

          <View style={styles.authButtonsContainer}>
            <View style={styles.buttonSpacer} />
            <AuthButton onPress={handleGoogleSignIn} provider="Google" />
          </View>

          <Text style={styles.disclaimer}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    alignSelf: 'center',
    width: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
    marginBottom: 40,
  },
  authButtonsContainer: {
    width: '100%',
    marginTop: 40,
    maxWidth: 320,
  },
  buttonSpacer: {
    height: 16,
  },
  disclaimer: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
    marginTop: 40,
    maxWidth: 300,
  },
});
export default SignInPage;
