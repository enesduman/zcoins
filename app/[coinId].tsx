import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Image,
} from "react-native";
import axios from "axios";
import { LineChart } from "react-native-gifted-charts";
import { NativeStackScreenProps } from "react-native-screens/lib/typescript/native-stack/types";
import { RootStackParamList } from "./_layout";

interface pointerDataType {
  date: string;
  value: number;
}

type DetailScreenProps = NativeStackScreenProps<RootStackParamList, "Detail">;

export const DetailScreen: React.FC<DetailScreenProps> = ({ route }) => {
  const { coinId } = route.params;
  const [priceData, setPriceData] = useState({
    currentPrice: 0,
    priceChange: 0,
    highPrice: 0,
    lowPrice: 0,
    volume: 0,
    priceHistory: [{ x: 0, y: 0 }],
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<pointerDataType[]>([
    { value: 0, date: "" },
  ]);
  const [selectedRange, setSelectedRange] = useState({
    name: "24 H",
    requestData: "1d",
  });

  const [selectedDateRange, setSelectedDateRange] = useState([
    { name: "1 H", requestData: "1h" },
    { name: "4 H", requestData: "4h" },
    { name: "12 H", requestData: "12h" },
    { name: "24 H", requestData: "1d" },
    { name: "3 D", requestData: "3d" },
    { name: "1 W", requestData: "1w" },
    { name: "1 M", requestData: "1M" },
  ]);
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    fetchPriceData();
  }, []);

  const fetchPriceData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://api.binance.com/api/v3/ticker/24hr",
        {
          params: { symbol: coinId },
        }
      );
      const data = response.data;

      const currentPrice = parseFloat(data.lastPrice);
      const priceChange = parseFloat(data.priceChangePercent);
      const highPrice = parseFloat(data.highPrice);
      const lowPrice = parseFloat(data.lowPrice);
      const volume = parseFloat(data.volume);

      const priceHistory = [
        { x: new Date().setHours(0, 0, 0, 0), y: lowPrice },
        { x: new Date().setHours(4, 0, 0, 0), y: lowPrice * 1.05 },
        { x: new Date().setHours(8, 0, 0, 0), y: highPrice * 0.95 },
        { x: new Date().setHours(12, 0, 0, 0), y: highPrice * 1.1 },
        { x: new Date().setHours(16, 0, 0, 0), y: lowPrice * 1.2 },
        { x: new Date().setHours(20, 0, 0, 0), y: currentPrice },
      ];

      setPriceData({
        currentPrice,
        priceChange,
        highPrice,
        lowPrice,
        volume,
        priceHistory,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching price data:", error);
    }
  };

  const getCoinHistoryData = async () => {
    setLoading(true);
    const response = await axios.get(
      `https://api.binance.com/api/v3/klines?symbol=${coinId}&interval=${selectedRange.requestData}`
    );
    return response;
  };

  const checkTimeZone = (time: number | string) => {
    const date = new Date(time);
    const readableDate = date.toUTCString();
    return readableDate;
  };

  useEffect(() => {
    getCoinHistoryData()
      .then((res) => {
        setChartData(
          res.data.map((item: string[] | number[]) => ({
            value: Number(item[1]),
            date: checkTimeZone(item[0]),
          }))
        );
      })
      .catch((err) => {
        console.log("err", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedRange]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headContainer}>
        <Text style={styles.price}>${priceData.currentPrice.toFixed(2)}</Text>
        <Text
          style={{
            ...styles.change,
            color: priceData.priceChange >= 0 ? "#21BF73" : "#D90429",
          }}
        >
          {priceData.priceChange.toFixed(2)}% (24h)
        </Text>
      </View>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <LineChart
            areaChart
            data={chartData}
            width={Dimensions.get("window").width - 30}
            hideDataPoints
            spacing={2}
            color="#0063F5"
            thickness={2}
            startFillColor="#fff"
            endFillColor="#fff"
            startOpacity={1}
            endOpacity={0.2}
            initialSpacing={2}
            noOfSections={1}
            yAxisColor="white"
            yAxisThickness={0}
            rulesType="solid"
            rulesColor="transparent"
            pointerConfig={{
              pointerStripColor: "#ccc",
              pointerStripWidth: 3,
              pointerColor: "#0063F5",
              radius: 3,
              pointerLabelWidth: 80,
              pointerLabelHeight: 60,
              activatePointersOnLongPress: true,

              autoAdjustPointerLabelPosition: true,
              pointerLabelComponent: (items: pointerDataType[]) => {
                return (
                  <View
                    style={{
                      height: 90,
                      width: 100,
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#0063F5",
                        fontSize: 14,
                        marginBottom: 6,
                        textAlign: "center",
                      }}
                    >
                      {items[0].date}
                    </Text>

                    <View
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 6,
                        borderRadius: 16,
                        backgroundColor: "white",
                        borderWidth: 1,
                        borderColor: "#0063F5",
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        {"$" + items[0].value + ".0"}
                      </Text>
                    </View>
                  </View>
                );
              },
            }}
          />
          <View style={styles.dateRangePicker}>
            {selectedDateRange.map((range, i) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedRange(range);
                  }}
                  key={i}
                  style={[
                    styles.dateButton,
                    selectedRange.name === range.name && styles.selectedButton,
                  ]}
                >
                  <Text>{range.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.marketTitle}>Market Stats</Text>

          <View style={styles.wrapper}>
            <View style={styles.infoFirstWrap}>
              <Image
                style={styles.icon}
                source={require("../assets/images/high.png")}
              />
              <Text style={styles.statTitle}>High Price (24h)</Text>
            </View>
            <Text style={styles.statValue}>
              ${priceData.highPrice.toFixed(2)}
            </Text>
          </View>
          <View style={styles.wrapper}>
            <View style={styles.infoFirstWrap}>
              <Image
                style={styles.icon}
                source={require("../assets/images/circle.png")}
              />
              <Text style={styles.statTitle}>Low Price (24h)</Text>
            </View>
            <Text style={styles.statValue}>
              ${priceData.lowPrice.toFixed(2)}
            </Text>
          </View>
          <View style={styles.wrapper}>
            <View style={styles.infoFirstWrap}>
              <Image
                style={styles.icon}
                source={require("../assets/images/volume.png")}
              />
              <Text style={styles.statTitle}>Volume (24h)</Text>
            </View>
            <Text style={styles.statValue}>
              {priceData.volume.toFixed(2)} {coinId.split("USDT", 1)}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: "500",
    color: "#212529",
  },
  change: {
    fontSize: 12,
    fontWeight: "600",
  },
  stats: {
    width: "100%",
  },
  stat: {
    marginBottom: 20,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6C757D",
    marginLeft: 5,
  },
  statValue: {
    fontSize: 14,
    color: "#343A40",
    fontWeight: "600",
  },
  marketTitle: {
    fontSize: 20,
    color: "#212529",
    margin: 9,
    paddingLeft: 10,
    marginTop: 25,
  },
  wrapper: {
    display: "flex",
    flexDirection: "row",
    margin: 9,
    justifyContent: "space-between",
    padding: 10,
  },
  headContainer: {
    flexDirection: "row",
    gap: 10,
    margin: 16,
    alignItems: "center",
  },
  dateRangePicker: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
  },
  dateButton: {
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "#DFE2E4",
    padding: 8,
  },
  selectedButton: {
    backgroundColor: "#ECF4FF",
    borderColor: "#0063f5",
    borderRadius: 20,
    padding: 8,
    borderWidth: 0.5,
  },
  icon: {
    width: 15,
    height: 15,
  },
  infoFirstWrap: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
