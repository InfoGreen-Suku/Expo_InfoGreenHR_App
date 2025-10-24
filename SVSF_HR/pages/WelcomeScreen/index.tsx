import { scaleFont } from '@/constants/ScaleFont'; // Assuming this utility is available
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { BackHandler, Dimensions, Image, Text, TouchableHighlight, View } from 'react-native';
import { styles } from './style'; // Assuming styles are defined here

// --- Page Data Definition ---
const PAGES = [
  {
    imageSource: require('../../assets/images/Capture.png'),
    title: 'Effortless GST Invoicing',
    subtitle: 'Streamline your invoicing process with our user-friendly GST billing app. Say goodbye to manual calculations and paperwork.',
  },
  {
    imageSource: require('../../assets/images/Capture2.png'),
    title: 'Stay Compliant, Stay Confident',
    subtitle: 'Ensure GST compliance effortlessly with our intuitive app. Generate accurate invoices and reports, and stay ahead of regulatory changes',
  },
  {
    imageSource: require('../../assets/images/Capture3.png'),
    title: 'Boost Productivity, Minimize Errors',
    subtitle: 'Maximize efficiency in your business operations with our GST billing solution. Reduce errors, save time, and focus on growth.',
  },
];

const TOTAL_PAGES = PAGES.length;
const ScreenHeight = Dimensions.get('window').height;
export default function WelcomeScreen() {
  const navigation = useNavigation<any>();
  // State to track the current onboarding page index
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // --- Hardware Back Button Handler ---
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // Exit the app when back button is pressed on the onboarding screen
        BackHandler.exitApp();
        return true;
      },
    );
    return () => backHandler.remove(); // Cleanup the event listener
  }, []);

  // --- Navigation Handlers ---
  const handleStart = () => {
    navigation.navigate("Login");
  };

  const handleNext = () => {
    if (currentPageIndex < TOTAL_PAGES - 1) {
      setCurrentPageIndex(prevIndex => prevIndex + 1);
    }
  };

  // --- Custom Components (Recreated) ---

  // Customized DOT indicator
  const DotComponent = ({ index }: { index: number }) => {
    const selected = index === currentPageIndex;
    return (
      <TouchableHighlight underlayColor={'transparent'} onPress={() => setCurrentPageIndex(index)}
        key={index}
        style={[
          styles.dotcomponent, // Assuming styles.dotcomponent exists
          selected && { paddingHorizontal: 4, paddingVertical: 1, backgroundColor: '#009333' },
        ]}>
        <View
          style={[
            styles.dotsub, // Assuming styles.dotsub exists
            selected ? { backgroundColor: '#009333', borderRadius: 5 } : '',
          ]}></View>
      </TouchableHighlight>
    );
  };

  // Customized DONE/START button
  const DoneButtonComponent = () => {
    return (
      <View style={{ width: 100, padding: 8, alignItems: 'center' }}>
        <TouchableHighlight
          style={{ backgroundColor: '#009333', borderRadius: 10, padding: 6 }}
          underlayColor={'transparent'}
          onPress={handleStart}
        >
          <Text style={{ color: '#fff', fontSize: scaleFont(17), fontWeight: 400 }}>START</Text>
        </TouchableHighlight>
      </View>
    );
  };

  // Customized NEXT button
  const NextButtonComponent = () => {
    return (
      <View style={{ width: 100, padding: 8, alignItems: 'center' }}>
        <TouchableHighlight
          style={{ backgroundColor: '#009333', borderRadius: 10, padding: 6 }}
          underlayColor={'transparent'}
          onPress={handleNext}
        >
          <Text style={{ color: '#fff', fontSize: scaleFont(17), fontWeight: 400 }}>NEXT</Text>
        </TouchableHighlight>
      </View>
    );
  };

  // --- Main Render Logic ---
  const currentPage = PAGES[currentPageIndex];
  const isLastPage = currentPageIndex === TOTAL_PAGES - 1;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'space-between' }}>

      {/* Header Logo */}
      <Image
        style={{ height: '11%', width: '70%', alignSelf: 'center', marginTop: scaleFont(50) }}
        source={require('../../assets/images/Logo1.png')}
      />

      {/* Current Onboarding Content */}
      <View style={{ flex: 1, paddingHorizontal: scaleFont(20), paddingTop: scaleFont(10), alignItems: 'center' }}>
        <Image
          style={styles.image}
          source={currentPage.imageSource}
        />
        <Text style={styles.title}>{currentPage.title}</Text>
        <Text style={styles.subtitle}>{currentPage.subtitle}</Text>
      </View>

      {/* Bottom Bar (Dots and Buttons) */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 10,
          height: ScreenHeight * 0.1,
          marginBottom: 10,
        }}
      >

        <View style={{ width: 100 }} />

        {/* Dots Indicator */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', flex: 1 }}>
          {PAGES.map((_, index) => (
            <DotComponent key={index} index={index} />
          ))}
        </View>

        {/* Next/Done Button */}
        {isLastPage ? <DoneButtonComponent /> : <NextButtonComponent />}
      </View>
    </View>
  );
}