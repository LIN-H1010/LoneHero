import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        tabBarActiveTintColor: '#e94560', 
        tabBarStyle: { backgroundColor: '#1a1a2e', borderTopWidth: 0 }, 
        headerStyle: { backgroundColor: '#1a1a2e' }, 
        headerTintColor: '#fff',
        tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' }
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: '主城', 
          headerTitle: '明珠港',
        }} 
      />
      <Tabs.Screen 
        name="battle" 
        options={{ 
          title: '战斗', 
          headerTitle: '哥布林森林',
        }} 
      />
      <Tabs.Screen 
        name="inventory" 
        options={{ 
          title: '背包', 
          headerTitle: '你的背包',
        }} 
      />
    </Tabs>
  );
}
