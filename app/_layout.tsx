import { NavigationContainer, RouteProp } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StyleSheet, Text } from "react-native";
import HomeScreen from "./index";
import { DetailScreen } from "./[coinId]";
import * as SplashScreen from "expo-splash-screen";

export type RootStackParamList = {
  Home: undefined;
  Detail: { coinId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 2000);

export default function RootLayout() {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator>
        <Stack.Screen
          options={{
            title: "",
            headerTitleStyle: {},
            headerLeft: () => (
              <Text style={styles.appbarTitle}>Trending Coins</Text>
            ),
          }}
          name="Home"
          component={HomeScreen}
        />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={({
            route,
          }: {
            route: RouteProp<RootStackParamList, keyof RootStackParamList>;
          }) => ({
            title: "",
            headerBackTitle: route?.params?.coinId,
            headerBackTitleStyle: {
              color: "#212529",
              fontSize: 20,
              fontWeight: "700",
            },
            headerTintColor: "#212529",
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  appbarTitle: {
    color: "#212529",
    fontSize: 20,
    fontWeight: "700",
    width: "100%",
    marginLeft: 20,
  },
});
