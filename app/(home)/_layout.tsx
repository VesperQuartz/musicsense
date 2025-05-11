import { Tabs } from 'expo-router';

const HomeLayout = () => {
  return (
    <Tabs>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="songs" />
    </Tabs>
  );
};

export default HomeLayout;
