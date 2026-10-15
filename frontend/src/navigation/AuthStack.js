import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../presentation/screens/LoginScreen';
import { RegisterScreen } from '../presentation/screens/RegisterScreen';

const Stack = createNativeStackNavigator();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
