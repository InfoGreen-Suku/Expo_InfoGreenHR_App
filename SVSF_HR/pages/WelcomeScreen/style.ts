import { scaleFont } from "@/constants/ScaleFont";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    background: {
      flex: 1,
      resizeMode: 'contain', // or 'stretch' or 'contain'
      justifyContent: 'center',
    },
    title: {
      color: '#009333',
      fontFamily: 'Poppins-Light',
      fontWeight: 'bold',
      fontSize: scaleFont(20),
      textAlign: 'center',
    },
    subtitle: {
      color: '#009333',
      fontFamily: 'Poppins-Light',
      fontSize: scaleFont(14),
      maxWidth: '70%',
      textAlign: 'center',
      marginBottom: 300,
    },
    image: {
      height: 300,
      width: 380,
      resizeMode: 'contain',
    },
    dotcomponent: {
      width: 30,
      height: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 5,
      marginHorizontal: 4,
    },
    dotsub: {
      width: '100%',
      height: '100%',
      borderRadius: 5,
      backgroundColor: 'grey',
    },
    nextbtn: {
      width: 100,
      padding: 2,
      alignItems: 'center',
    },
    nextbtntxt: {
      fontFamily: 'Poppins-Light',
      color: '#009333',
      fontWeight: 'bold',
      fontSize: scaleFont(10),
    },
  });
  