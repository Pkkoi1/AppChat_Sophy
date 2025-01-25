import React, { useState, useEffect } from "react";
import Access from "@/components/Screens/Access/Access";
import Main from "@/components/Screens/Access/Main";
import { StatusBar, StyleSheet, View } from "react-native";

export default function App() {
  const [showMain, setShowMain] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMain(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      {showMain ? <Main /> : <Access />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
  },
});




