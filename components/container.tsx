import { Platform, SafeAreaView, StatusBar, StyleSheet } from 'react-native';

export const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SafeAreaView
        style={[
          styles.container,
          { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
        ]}>
        {children}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
  },
});
