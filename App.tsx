import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// NOTE: Stripe is not supported in Expo Managed Workflow
// If you need Stripe, consider using Expo Bare or implement via WebView
// import { StripeProvider } from '@stripe/stripe-react-native';
import DefaultScreen from './pages/index';
import OnboardingScreen from './pages/onboarding';
import LoginScreen from './pages/login';
import RegisterScreen from './pages/register';
import OtpScreen from './pages/otp';
import SocialScreen from './pages/social';
import EmailScreen from './pages/forgot/index';
import ForgotOtpScreen from './pages/forgot/otp';
import FinalScreen from './pages/forgot/final';
import HomeScreen from './pages/home/HomeScreen';
import CarDetailsScreen from './pages/home/CarDetailsScreen';
import CarsScreen from './pages/home/CarsScreen';
import ChatsScreen from './pages/home/ChatsScreen';
import ConfirmationScreen from './pages/home/ConfirmationScreen';
import DeliveryScreen from './pages/home/DeliveryScreen';
import EarningsScreen from './pages/home/EarningsScreen';
import EditScreen from './pages/home/EditScreen';
import FareScreen from './pages/home/FareScreen';
import FavoriteScreen from './pages/home/FavoriteScreen';
import HistoryScreen from './pages/home/HistoryScreen';
import LanguageScreen from './pages/home/LanguageScreen';
import MapScreen from './pages/home/MapScreen';
import MsgScreen from './pages/home/MsgScreen';
import NotificationScreen from './pages/home/NotificationScreen';
import NotificationSettings from './pages/home/NotificationSettings';
import PaymentScreen from './pages/home/PaymentScreen';
import PrebookedScreen from './pages/home/PrebookedScreen';
import PreferenceScreen from './pages/home/PreferenceScreen';
import ProfileScreen from './pages/home/ProfileScreen';
import ProfiledetailsScreen from './pages/home/ProfiledetailsScreen';
import RateScreen from './pages/home/RateScreen';
import RatingScreen from './pages/home/RatingScreen';
import ReceiptScreen from './pages/home/ReceiptScreen';
import RequestsScreen from './pages/home/RequestsScreen';
import SearchScreen from './pages/home/SearchScreen';
import SecurityScreen from './pages/home/SecurityScreen';
import SettingsScreen from './pages/home/SettingsScreen';
import SupportScreen from './pages/home/SupportScreen';
import TopupScreen from './pages/home/TopupScreen';
import TripsScreen from './pages/home/TripsScreen';
import WithdrawScreen from './pages/home/WithdrawScreen';
import YourRidesScreen from './pages/home/YourRidesScreen';
// Profile Setup Screens
import NameScreen from './pages/profile/name';
import CityScreen from './pages/profile/city';
import VehicleScreen from './pages/profile/vehicle';
import DocumentsScreen from './pages/profile/documents';
import PaymentSetupScreen from './pages/profile/payment';
import TermsScreen from './pages/profile/terms';
import FinalSetupScreen from './pages/profile/final';
import Toast from 'react-native-toast-message';
import { ThemeProviderContext } from './hooks/themeContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    // NOTE: StripeProvider removed for Expo compatibility
    // For Stripe integration, consider using Expo Bare workflow or WebView implementation
    <ThemeProviderContext>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        >
          <Stack.Screen name="index" component={DefaultScreen} />
          <Stack.Screen name="onboarding" component={OnboardingScreen} />
          <Stack.Screen name="login" component={LoginScreen} />
          <Stack.Screen name="register" component={RegisterScreen} />
          <Stack.Screen name="otp" component={OtpScreen} />
          <Stack.Screen name="social" component={SocialScreen} />
          <Stack.Screen name="forgot" component={EmailScreen} />
          <Stack.Screen name="forgot/otp" component={ForgotOtpScreen} />
          <Stack.Screen name="forgot/final" component={FinalScreen} />

          <Stack.Screen name="home" component={HomeScreen} />
          <Stack.Screen name="home/cars" component={CarsScreen} />
          <Stack.Screen name="home/cardetails" component={CarDetailsScreen} />
          <Stack.Screen name="home/chats" component={ChatsScreen} />
          <Stack.Screen name="home/confirmation" component={ConfirmationScreen} />
          <Stack.Screen name="home/delivery" component={DeliveryScreen} />
          <Stack.Screen name="home/earnings" component={EarningsScreen} />
          <Stack.Screen name="home/fare" component={FareScreen} />
          <Stack.Screen name="home/edit" component={EditScreen} />
          <Stack.Screen name="home/favorite" component={FavoriteScreen} />
          <Stack.Screen name="home/history" component={HistoryScreen} />
          <Stack.Screen name="home/language" component={LanguageScreen} />
          <Stack.Screen name="home/msg" component={MsgScreen} />
          <Stack.Screen name="home/map" component={MapScreen} />
          <Stack.Screen name="home/notification" component={NotificationScreen} />
          <Stack.Screen name="home/notificationsettings" component={NotificationSettings} />
          <Stack.Screen name="home/payment" component={PaymentScreen} />
          <Stack.Screen name="home/prebooked" component={PrebookedScreen} />
          <Stack.Screen name="home/preference" component={PreferenceScreen} />
          <Stack.Screen name="home/profile" component={ProfileScreen} />
          <Stack.Screen name="home/profiledetails" component={ProfiledetailsScreen} />
          <Stack.Screen name="home/rate" component={RateScreen} />
          <Stack.Screen name="home/rating" component={RatingScreen} />
          <Stack.Screen name="home/receipt" component={ReceiptScreen} />
          <Stack.Screen name="home/requests" component={RequestsScreen} />
          <Stack.Screen name="home/search" component={SearchScreen} />
          <Stack.Screen name="home/security" component={SecurityScreen} />
          <Stack.Screen name="home/settings" component={SettingsScreen} />
          <Stack.Screen name="home/support" component={SupportScreen} />
          <Stack.Screen name="home/topup" component={TopupScreen} />
          <Stack.Screen name="home/trips" component={TripsScreen} />
          <Stack.Screen name="home/withdraw" component={WithdrawScreen} />
          <Stack.Screen name="home/yourrides" component={YourRidesScreen} />
          
          {/* Profile Setup Screens */}
          <Stack.Screen name="profile/name" component={NameScreen} />
          <Stack.Screen name="profile/city" component={CityScreen} />
          <Stack.Screen name="profile/vehicle" component={VehicleScreen} />
          <Stack.Screen name="profile/documents" component={DocumentsScreen} />
          <Stack.Screen name="profile/payment" component={PaymentSetupScreen} />
          <Stack.Screen name="profile/terms" component={TermsScreen} />
          <Stack.Screen name="profile/final" component={FinalSetupScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </ThemeProviderContext>
  );
}
