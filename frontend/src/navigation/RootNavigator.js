import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useAuth } from '../presentation/context/AuthContext';
import { SplashScreen } from '../presentation/screens/SplashScreen';
import { colors } from '../theme/theme';
import { AppStack } from './AppStack';
import { AuthStack } from './AuthStack';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

export function RootNavigator() {
  const { isAuthenticated, isRestoring } = useAuth();

  if (isRestoring) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
