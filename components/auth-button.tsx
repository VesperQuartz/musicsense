import FontAwesome from '@expo/vector-icons/FontAwesome';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';

type AuthButtonProps = {
  provider: 'Spotify' | 'Google' | 'Github';
  onPress?: () => void;
  isLoading?: boolean;
};

export default function AuthButton({ provider, onPress, isLoading }: AuthButtonProps) {
  return (
    <TouchableOpacity style={[styles.button]} onPress={onPress} disabled={isLoading}>
      {isLoading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <View style={styles.buttonContent}>
          <FontAwesome name="google" color="#fff" size={25} style={styles.icon} />
          <Text style={styles.buttonText}>Continue with {provider}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%',
    backgroundColor: '#5C13B5',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
});
