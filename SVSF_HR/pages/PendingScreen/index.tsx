import { postUserDetails } from '@/hooks/api/postUserDetails';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useDispatch, useSelector } from 'react-redux';
import { styles } from './style';
export default function PendingScreen() {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const navigation = useNavigation<any>();
  const [bending, setBending] = useState<boolean>(false)
  const [userDetails, setUserData] = useState<any>("")
  const dispatch = useDispatch()
  // const currentDate = new Date();
  const status = useSelector((store: any) => store?.user?.userData?.status)
  const [qrData, setQrData] = useState<any>("")
  // const key = "InfoGreen#!@#$%" + currentDate.getHours().toString().padStart(2, '0') + currentDate.getMinutes().toString().padStart(2, '0');
  // const plaintext = 'InfoGreen_App';

  // Encrypt
  // const ciphertext = CryptoJS.AES.encrypt(plaintext, key).toString();


  // getting deatils from the localstorage and passing it into the api and checking the user Status and all the details are stored under the keyword "userDetails" in api

  const handleData = async () => {
    try {
      const details = await postUserDetails(userDetails)
      dispatch({ type: 'POST_USER_SUCCESS', payload: details });
      if (status === 'success') {
        setBending(false)
        setModalVisible(false)
        navigation.navigate('Webview');
      } else {
        setBending(true)
        setModalVisible(true);
        // navigation.navigate('Webview');
      }

    } catch (error) {
      console.log(error);
    }
  };

  // handle the refresh button and checking the user status
  const handleRefresh = async () => {
    try {
      const UserData = await AsyncStorage.getItem('userDetails');
      if (UserData) {
        setUserData(JSON.parse(UserData))
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    handleRefresh()
  }, [])

  // handle backbutton for moving previous page or exit the app
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          BackHandler.exitApp();
        }
        return true;
      },
    );

    return () => backHandler.remove();
  }, [navigation]);

  // For bolding the word
  const B = (props: any) => <Text style={{ fontWeight: 'bold' }}>{props.children}</Text>;

  useEffect(() => {
    const data = { name: userDetails.name, companyName: userDetails.companyName,appCode: userDetails.appCode };
    setQrData(data);
    console.log(data);
  }, [userDetails]);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
      }}>
      {bending ? <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalView}>
          <QRCode
            value={JSON.stringify(qrData)}
            size={170}
            logo={require('../../assets/images/Logo.png')}
            logoSize={50}
            logoMargin={2}
            logoBorderRadius={100}
            logoBackgroundColor='white'
            // color='#009333'
            backgroundColor='white'
          />
          <Text
            style={styles.modalText1}>
            We are currently processing your activation. Kindly remain patient
            while we finalize the process.
          </Text>

          <Text
            style={styles.modalText2}>
            For any inquiries, Please reach out to us:{' '}
          </Text>
          <Text
            style={styles.modalText3}>
            Mobile: <B>9566950467</B> {'\n'} Email: <B>support@infogreen.in</B>{' '}
            .
          </Text>
          <TouchableOpacity
            style={styles.modalBtn}
            onPress={() => setModalVisible(false)}>
            <Text style={styles.modalBtnText}>Ok</Text>
          </TouchableOpacity>

        </View>
      </Modal> : ""}
      <Image
        source={require('../../assets/images/Logo.png')}
        style={styles.Logo}
      />
      <Image
        source={require('../../assets/images/task.png')}
        style={styles.BigImage}
      />
      <Text
        style={styles.text}>
        We're currently processing your activation request. Please bear with us
        as we work to complete it. {'\n'} Thank you for your patience!
      </Text>
      <TouchableOpacity style={styles.Btn} onPress={handleData}>
        <Text style={styles.btnText}>Refresh</Text>
      </TouchableOpacity>
      {/* <Button
          title={'Refresh'}
          buttonStyle={{backgroundColor: '#009333'}}
          containerStyle={{width: '50%', marginTop: 20}}
          onPress={handleData}
        /> */}
    </View>
  );
}
