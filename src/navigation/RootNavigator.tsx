import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from '@firebase/auth';
import { auth } from '@/config/firebase';
import { useAuthStore } from '@/stores/authStore';

// Screens
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { LearnScreen } from '@/screens/tabs/LearnScreen';
import { TranslateScreen } from '@/screens/tabs/TranslateScreen';
import { BlitzScreen } from '@/screens/tabs/BlitzScreen';

// Colors
import { colors } from '@/utils/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const LearnStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="LearnMain" component={LearnScreen} />
  </Stack.Navigator>
);

const TranslateStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="TranslateMain" component={TranslateScreen} />
  </Stack.Navigator>
);

const BlitzStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="BlitzMain" component={BlitzScreen} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarLabel: route.name === 'Learn' ? 'Learn' : route.name === 'Translate' ? 'Translate' : 'Blitz',
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: {
        borderTopColor: colors.border,
        paddingBottom: 8,
        paddingTop: 8,
        height: 60,
      },
      tabBarIcon: ({ focused, color }) => {
        let iconName: any;
        if (route.name === 'Learn') {
          iconName = focused ? 'book' : 'book-outline';
        } else if (route.name === 'Translate') {
          iconName = focused ? 'globe' : 'globe-outline';
        } else {
          iconName = focused ? 'flash' : 'flash-outline';
        }
        return <Ionicons name={iconName} size={24} color={color} />;
      },
    })}
  >
    <Tab.Screen
      name="Learn"
      component={LearnStack}
      options={{
        title: 'Learn',
      }}
    />
    <Tab.Screen
      name="Translate"
      component={TranslateStack}
      options={{
        title: 'Translate',
      }}
    />
    <Tab.Screen
      name="Blitz"
      component={BlitzStack}
      options={{
        title: 'Blitz',
      }}
    />
  </Tab.Navigator>
);

export const RootNavigator: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
        }}
      >
        {!user ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              animationTypeForReplace: 'pop',
            }}
          />
        ) : (
          <Stack.Screen name="MainTabs" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
