import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'user_jwt_token';

/**
 * Almacenamiento seguro del JWT.
 * Nunca usar AsyncStorage: exponen el token en texto plano.
 * Expo SecureStore cifra el valor usando el Keychain (iOS) / Keystore (Android).
 */
export async function saveAuthToken(token) {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error al guardar el token de forma segura:', error);
    throw error;
  }
}

export async function getAuthToken() {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error al leer el token seguro:', error);
    return null;
  }
}

export async function deleteAuthToken() {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error al eliminar el token seguro:', error);
  }
}
