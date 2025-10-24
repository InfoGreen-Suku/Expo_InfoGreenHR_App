import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import * as ExpoPrint from 'expo-print';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    BackHandler,
    Modal,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import ViewShot from 'react-native-view-shot';

import { scaleFont } from '@/constants/ScaleFont';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Directory, File, Paths } from 'expo-file-system';
import Pdf from 'react-native-pdf';
import Share from 'react-native-share';
import { styles } from './style';

export default function Print({ route }: any) {
    // pdfpath params is getting from the webview components
    const { pdfPath } = route.params ?? {};
    const { name } = route.params ?? {};
    const { number } = route.params ?? {};
    const pdfFilePath = pdfPath;
    const PdfName = name;
    const Number = number;

    const navigation = useNavigation<any>();
    const viewShotRef = useRef<any>(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                navigation.goBack();
                return true;
            },
        );
        return () => backHandler.remove();
    }, []);

    // capture screenshot for sharing jpg.
    const capturePageAsImage = async () => {
        try {
            const { width, height } = await viewShotRef.current.capture();
            // Calculate A4 size
            const a4Width = 2480; // A4 width in pixels
            const a4Height = 3508; // A4 height in pixels
            const scaleFactor = Math.min(a4Width / width, a4Height / height);
            const newWidth = width * scaleFactor;
            const newHeight = height * scaleFactor;

            // Capture the screenshot with new dimensions
            const options = {
                format: 'jpg',
                quality: 1,
                width: newWidth,
                height: newHeight,
            };
            const uri = await viewShotRef.current.capture(options);
            console.log('Captured image URI:', uri);
            saveImageWithWatermark(uri);
            setModalVisible(false);
        } catch (error) {
            console.log('Error capturing page:', error);
        }
    };
    const saveImageWithWatermark = async (uri: any) => {

        try {
            const timestamp = new Date().getTime();
            const filename = `${PdfName} - ${timestamp}.jpg`;
            const targetDirectory = new Directory(Paths.document);
            const filePath = `${targetDirectory.uri}/${filename}`;
            const targetFile = new File(filePath);
            const dirInfo = await targetDirectory.info();
            if (!dirInfo.exists) {
                await targetDirectory.create({ intermediates: true });
            }

            // ✅ Check if the file already exists
            const fileInfo = await targetFile.info();
            if (fileInfo.exists) {
                shareImage(targetFile.uri, Number);
                return;
            }
            const sourceFile = new File(uri);
            await sourceFile.copy(targetFile);
            shareImage(targetFile.uri, Number);
        } catch (error) {
            console.log('Error saving image with watermark:', error);
            return null;
        }
    };

    //  print
    const handlePrint = async () => {
        try {
            await ExpoPrint.printAsync({
                uri: pdfFilePath
            });
        } catch (error) {
            console.log('Error printing:', error);
            Alert.alert('Error', 'Failed to print document');
        }
    };

    //    save pdf
    const savePDF = async () => {
        setModalVisible(false);

        try {
            const targetDirectory = new Directory(Paths.document);
            const timestamp = new Date().getTime();
            const filename = `${PdfName} - ${timestamp}.pdf`;
            const destPath = `${targetDirectory.uri}/${filename}`;
            const targetFile = new File(destPath);
            const dirInfo = await targetDirectory.info();
            if (!dirInfo.exists) {
                await targetDirectory.create({ intermediates: true });
            }

            // ✅ Check if the file already exists
            const fileInfo = await targetFile.info();
            if (fileInfo.exists) {
                sharePDF(targetFile.uri, Number);
                return;
            }
            const sourceFile = new File(pdfFilePath);
            await sourceFile.copy(targetFile);

            sharePDF(targetFile.uri, Number);
        } catch (error) {
            console.log('Error saving PDF:', error);
            return null;
        }
    };

    const shareImage = async (imageUri: string, number?: string) => {
        try {
            const shareOptions:any = {
                url: `content://${imageUri}`,
                type: 'image/jpeg',
                title: 'Share Image',
              };
              if (number) {
                (shareOptions.social = Share.Social.WHATSAPP),
                  (shareOptions.whatsAppNumber = number);
              }
              Share.open(shareOptions)
                .then(res => console.log(res))
                .catch(err => {
                  err && console.log(err);
                });
        } catch (error) {
            console.error('Error sharing image:', error);
        }
    };

    const sharePDF = async (pdfPath: string, number?: string) => {

        try {
            console.log('number', number);
            const shareOptions:any = {
                url: `content://${pdfPath}`,
                type: 'application/pdf',
                title: 'Share PDF File',
              };
           
              if (number) {
                (shareOptions.social = Share.Social.WHATSAPP),
                  (shareOptions.whatsAppNumber = number);
              }
              Share.open(shareOptions)
                .then(res => {
                  console.log(res);
                })
                .catch(err => {
                  err && console.log(err);
                });
        } catch (error) {
            console.error('Error sharing PDF:', error);
        }
    };
    //handle BackButton for moving back to the previous page or exit app.
    const close = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>

            <View
                style={{
                    flexDirection: 'row',
                    gap: 50,
                    marginBottom: 30,
                    backgroundColor: '#009333',
                    width: '100%',
                    height: '7%',
                }}>
                <AntDesign name="close" size={scaleFont(25)} color="#fff" style={{ alignSelf: 'center', left: scaleFont(20), top: scaleFont(10), marginBottom: scaleFont(15) }}
                    onPress={close} />

                <Text
                    style={{
                        fontSize: scaleFont(20),
                        textAlign: 'center',
                        fontWeight: '500',
                        color: '#fff',
                        top: 12,
                    }}>
                    Preview
                </Text>
            </View>
            <ViewShot
                ref={viewShotRef}
                options={{ format: 'jpg', quality: 1 }}
                style={{ flex: 1 }}>

                <Pdf
                    source={{ uri: `file://${pdfFilePath}` }}
                    onLoadComplete={(numberOfPages, filePath) => {
                        console.log(`Number of pages: ${numberOfPages}`);
                        console.log(`File path: ${filePath}`);
                    }}
                    onPageChanged={(page, numberOfPages) => {
                        console.log(`Current page: ${page}`);
                    }}
                    onError={(error) => {
                        console.log(error);
                    }}
                    onPressLink={(uri) => {
                        console.log(`Link pressed: ${uri}`);
                    }}
                    style={styles.pdf}
                />
            </ViewShot>
            <View
                style={{
                    flexDirection: 'row',
                    gap: 50,
                    marginBottom: 50,
                    top: 20,
                    width: 160,
                    backgroundColor: '#009333',
                    borderRadius: 20,
                    justifyContent: 'center',
                    padding: 10,
                    alignSelf: 'center',
                }}>
                <AntDesign name="printer" size={30} color="#fff" style={{ alignSelf: 'center' }}
                    onPress={handlePrint} />

                <AntDesign name="share-alt" size={30} color="#fff" style={{ alignSelf: 'center' }}
                    onPress={() => setModalVisible(true)} />

            </View>
            {/* Modal for dropdown */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.modalText}>Share Options</Text>
                            <AntDesign name="close" size={scaleFont(25)} color="grey" style={{ alignSelf: 'center', marginBottom: scaleFont(10), left: scaleFont(80) }}
                                onPress={() => setModalVisible(false)} />

                        </View>
                        <View style={{ flexDirection: 'row', gap: scaleFont(20), top: scaleFont(10) }}>
                            <TouchableOpacity
                                onPress={capturePageAsImage}
                                style={{
                                    flexDirection: 'row',
                                    gap: 10,
                                    borderColor: '#009333',
                                    backgroundColor: '#009333',
                                    padding: 15,
                                    borderRadius: 8,
                                }}>
                                <FontAwesome name="image" size={20} color="#fff" />

                                <Text style={{ color: '#fff', fontSize: scaleFont(15) }}>
                                    Share as Image
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={savePDF}
                                style={{
                                    flexDirection: 'row',
                                    gap: 10,
                                    borderColor: '#009333',
                                    backgroundColor: '#009333',
                                    padding: 15,
                                    borderRadius: 8,
                                }}>
                                <FontAwesome name="file-pdf-o" size={20} color="#fff" />

                                <Text style={{ color: '#fff', fontSize: scaleFont(15) }}>
                                    Share as Pdf
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
