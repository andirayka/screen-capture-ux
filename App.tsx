import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PolicyScreen } from './src/screens/PolicyScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <PolicyScreen />
    </SafeAreaProvider>
  );
}
