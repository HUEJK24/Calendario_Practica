import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AgendaScreen } from '../presentation/screens/AgendaScreen';
import { EventsScreen } from '../presentation/screens/EventsScreen';

const Stack = createNativeStackNavigator();

export function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Agenda" component={AgendaScreen} />
      <Stack.Screen name="Events" component={EventsScreen} />
    </Stack.Navigator>
  );
}
