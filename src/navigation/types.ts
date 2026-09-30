import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
};

export type TabParamList = {
  Learn: undefined;
  Translate: undefined;
  Blitz: undefined;
};

export type LearnStackParamList = {
  LearnMain: undefined;
};

export type TranslateStackParamList = {
  TranslateMain: undefined;
};

export type BlitzStackParamList = {
  BlitzMain: undefined;
};

// Navigation prop types
export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type MainTabsScreenProps = NativeStackScreenProps<RootStackParamList, 'MainTabs'>;

export type LearnScreenProps = BottomTabScreenProps<TabParamList, 'Learn'>;
export type TranslateScreenProps = BottomTabScreenProps<TabParamList, 'Translate'>;
export type BlitzScreenProps = BottomTabScreenProps<TabParamList, 'Blitz'>;
