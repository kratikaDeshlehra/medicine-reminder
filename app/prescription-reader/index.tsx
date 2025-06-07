import { View, Text, Platform, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native'
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Tesseract from 'tesseract.js';



const API_KEY = 'AIzaSyDMealpFFPy2MqT2Zc_OHqPpUCyZQgvMLQ';

const PrescriptionReaderScreen = () => {


    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 1,
            base64: false,
        });

        if (!result.canceled) {
            setFileUri(result.assets[0].uri);
          //  await handleExtractText(result.assets[0].uri, 'image');
        }
    };

    const handlePickPdf = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/pdf',
            copyToCacheDirectory: true,
            multiple: false,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            setFileUri(uri);
            //handleExtractText(); // You may want to use different OCR for PDF
        }
    };

    const handleExtractText = {
        
    };


    const [fileUri, setFileUri] = useState<string | null>(null);
    const [textOutput, setTextOutput] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    return (
        <View style={styles.container}>
            <LinearGradient colors={["#1a8e2d", "#146922"]}
                style={styles.headerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }} />
            <View style={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={28} color="#1a8e2d" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Prescription Reader</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.container2}>
                <Text style={styles.heading}>Upload a prescription to automatically extract and track your medicines.</Text>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.button} onPress={handlePickImage}>
                        <Ionicons name="image-outline" size={20} color="#fff" />
                        <Text style={styles.buttonText}>Upload Image</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={handlePickPdf} >
                        <Ionicons name="document-outline" size={20} color="#fff" />
                        <Text style={styles.buttonText}>Upload PDF</Text>
                    </TouchableOpacity>
                </View>

                {fileUri && (
                    <View style={styles.preview}>
                        <Text style={styles.previewTitle}>Preview:</Text>
                        {fileUri.endsWith('.pdf') ? (
                            <Text style={styles.pdfText}>PDF uploaded: {fileUri.split('/').pop()}</Text>
                        ) : (
                            <Image source={{ uri: fileUri }} style={styles.image} />
                        )}
                    </View>
                )}

                {loading && <ActivityIndicator size="large" color="#1a8e2d" style={{ marginTop: 20 }} />}

                {textOutput !== '' && (
                    <View style={styles.outputBox}>
                        <Text style={styles.outputTitle}>Extracted Text:</Text>
                        <Text style={styles.outputText}>{textOutput}</Text>
                        {/* You can add a "Track These Medications" button here */}
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

export default PrescriptionReaderScreen


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    headerGradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: Platform.OS === "ios" ? 140 : 120,
    },
    content: {
        //flex: 1,
        paddingTop: Platform.OS === "ios" ? 50 : 30,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 20,
        zIndex: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "700",
        color: "white",
        marginLeft: 15,
    },
    heading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 20,
        color: '#1a8e2d',
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    button: {
        flexDirection: 'row',
        backgroundColor: '#1a8e2d',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        gap: 6,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },

    container2: {
        padding: 20,
        paddingTop: Platform.OS === "ios" ? 50 : 30,

    },
    preview: {
        marginVertical: 20,
        alignItems: 'center',
    },
    previewTitle: {
        fontWeight: 'bold',
        marginBottom: 10,
    },
    image: {
        width: 250,
        height: 250,
        resizeMode: 'contain',
        borderRadius: 10,
    },
    pdfText: {
        fontSize: 16,
        color: '#333',
    },
    outputBox: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f3f3f3',
        borderRadius: 8,
    },
    outputTitle: {
        fontWeight: 'bold',
        marginBottom: 10,
        fontSize: 16,
    },
    outputText: {
        color: '#444',
    },
})
