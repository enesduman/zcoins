import { RootStackParamList } from "@/app/_layout";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "react-native-screens/lib/typescript/native-stack/types";

const ws = new WebSocket("wss://stream.binance.com:9443/ws/!ticker@arr");

interface renderItemTypes {
  change: number;
  price: number;
  symbol: string;
}
interface coinTypes {
  e: string;
  E: number;
  s: string;
  ps: string;
  p: string;
  P: string;
  w: string;
  c: string;
  Q: string;
  o: string;
  h: string;
  l: string;
  v: string;
  q: string;
  O: number;
  C: number;
  F: number;
  L: number;
  n: number;
}
type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

const CryptoList: React.FC<HomeScreenProps> = ({ navigation }) => {
  const greenColor = "#21BF73";
  const redColor = "#D90429";

  const [loading, setLoading] = useState(true);
  const [realtimeList, setRealtimeList] = useState([]);
  const [highlighted, setHighlighted] = useState(false);

  // Binance WebSocket connection
  useEffect(() => {
    ws.onopen = () => {
      console.log("Connected to Binance WebSocket");
    };
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setRealtimeList(message);
      setHighlighted(true);
      setTimeout(() => {
        setHighlighted(false);
      }, 100);
      setLoading(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const replaceCoinName = (coinName: string) => {
    return coinName.replace(/(USDT)/, "/$1");
  };

  const getCoinShortName = (coinName: string) => {
    return coinName.split("USDT");
  };

  const renderItem = ({ item }: { item: renderItemTypes }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("Detail", { coinId: item.symbol })}
        style={[styles.item]}
      >
        <Image
          style={styles.logo}
          source={{
            uri: `https://play-lh.googleusercontent.com/CXYsmx277ONdjZgv0JpFRyczcZsV5xbMj1vXAYoxY-4sMe0ZuHCOgjFq-rrMc2n_Fg=w240-h480-rw`,
          }}
        />
        <View style={styles.info}>
          <Text style={styles.coinName}>{replaceCoinName(item.symbol)}</Text>
          <Text style={styles.coinShortcut}>
            {getCoinShortName(item.symbol)}
          </Text>
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 10,
              backgroundColor:
                highlighted === true && item.change > 0
                  ? greenColor
                  : highlighted === true && item.change < 0
                  ? redColor
                  : "#ccc",
            }}
          ></View>
        </View>

        <View>
          <Text style={styles.price}>{`$${item.price.toFixed(2)}`}</Text>
          <Text
            style={[
              styles.change,
              { color: item.change > 0 ? greenColor : redColor },
            ]}
          >
            {`${item.change.toFixed(2)}%`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  if (loading) {
    return <ActivityIndicator size={"large"} />;
  }
  return (
    <View style={styles.container}>
      <FlatList
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={10}
        windowSize={10}
        refreshControl={
          <RefreshControl
            progressBackgroundColor={"#36C2CE"}
            colors={["#fff"]}
            refreshing={loading}
          />
        }
        data={realtimeList
          .filter((item: coinTypes) => item.s.endsWith("USDT"))
          .map((item: coinTypes) => ({
            symbol: item.s,
            price: parseFloat(item.c),
            change: parseFloat(item.P),
          }))}
        renderItem={renderItem}
        keyExtractor={(item) => item.symbol}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    backgroundColor: "#FFFFFF",
    marginVertical: 5,
    width: "95%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 8,
    marginRight: "auto",
    marginLeft: "auto",
    padding: 10,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    borderWidth: 0,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.24,
    shadowRadius: 2.2,
  },
  firstItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  secondItem: {},
  thirdItem: {},
  title: {
    fontSize: 32,
  },
  coinTitle: {
    marginLeft: 10,
  },
  coinName: {
    marginVertical: 3,
    color: "#212529",
    fontWeight: "600",
    fontSize: 14,
  },
  coinShortcut: {
    color: "#6C757D",
    fontSize: 12,
  },
  lastPrice: {
    textAlign: "right",
  },
  redHighlight: {
    borderColor: "red",
    borderWidth: 0.5,
  },
  greenHighlight: {
    borderColor: "green",
    borderWidth: 0.5,
  },
  default: {
    borderColor: "#ccc",
    borderWidth: 0.5,
  },

  price: {
    flex: 1,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "600",
    color: "#343a40",
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 10,
  },
  change: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "right",
  },
  info: {
    flex: 1,
  },
});

export default CryptoList;
