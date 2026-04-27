import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';

import colors from '../theme/colors';

type ChildFamilyCodeScreenProps = {
  onBack?: () => void;
  onContinue?: (code?: string) => void;
};

export default function ChildFamilyCodeScreen({ onBack, onContinue }: ChildFamilyCodeScreenProps) {
  const [cameraVisible, setCameraVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [codeInput, setCodeInput] = useState('');

  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();

      if (!result.granted) {
        Alert.alert('Camera toestemming nodig', 'Geef toegang tot de camera om de code te scannen.');
        return;
      }
    }

    setCameraVisible(true);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TouchableOpacity activeOpacity={0.7} hitSlop={16} onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Welkom bij je gezin!</Text>
          <Text style={styles.subtitle}>Verbind met je ouder om te beginnen</Text>
        </View>

        <View style={styles.qrCard}>
          <View style={styles.qrFrame}>
            <View style={styles.qrPattern}>
              <View style={[styles.qrCorner, styles.qrCornerTopLeft]} />
              <View style={[styles.qrCorner, styles.qrCornerTopRight]} />
              <View style={[styles.qrCorner, styles.qrCornerBottomLeft]} />
              <View style={[styles.qrCorner, styles.qrCornerBottomRight]} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open camera"
                onPress={openCamera}
                style={({ pressed }) => [styles.qrCenterButton, pressed && styles.qrCenterButtonPressed]}
              >
                <Text style={styles.qrCenterText}>Open camera</Text>
              </Pressable>
            </View>
           
          </View>
        </View>

        <Text style={styles.sectionLabel}>Scan de code van je ouder</Text>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OF</Text>
          <View style={styles.divider} />
        </View>

        <Text style={styles.sectionHint}>Vul de code van je gezin in</Text>

        <View style={styles.inputShell}>
          <TextInput placeholder="Vul je uitnodigingscode in" placeholderTextColor="#B8C7D4" style={styles.input} value={codeInput} onChangeText={setCodeInput} autoCapitalize="characters" />
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={() => onContinue?.(codeInput.trim())} style={styles.primaryButton}>
          <Text style={styles.primaryText}>Ga verder</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={cameraVisible} animationType="slide" onRequestClose={() => setCameraVisible(false)}>
        <View style={styles.cameraScreen}>
          <View style={styles.cameraHeader}>
            <TouchableOpacity activeOpacity={0.75} hitSlop={16} onPress={() => setCameraVisible(false)} style={styles.cameraCloseButton}>
              <Text style={styles.cameraCloseText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.cameraTitle}>Camera openen</Text>
          </View>

          <View style={styles.cameraPreviewWrap}>
            <CameraView style={styles.cameraPreview} facing="back" />
          </View>

          <Text style={styles.cameraHint}>Richt de camera op de QR-code of gebruik deze preview om te testen.</Text>

          <TouchableOpacity activeOpacity={0.9} onPress={() => setCameraVisible(false)} style={styles.cameraDoneButton}>
            <Text style={styles.cameraDoneText}>Sluiten</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  backButton: {
    alignSelf: 'flex-start',
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    marginBottom: 10,
  },
  backArrow: {
    fontSize: 34,
    color: colors.primary,
  },
  header: {
    alignItems: 'center',
    marginBottom: 26,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    color: colors.textStrong,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 18,
    fontSize: 18,
    lineHeight: 26,
    color: '#8A97A9',
    textAlign: 'center',
  },
  qrCard: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#54C8D7',
    borderRadius: 28,
    padding: 18,
    marginHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.52)',
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  qrFrame: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#0B5D81',
    padding: 18,
    position: 'relative',
  },
  qrPattern: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
    overflow: 'hidden',
  },
  qrCorner: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderColor: '#FF1F1F',
  },
  qrCornerTopLeft: {
    top: 14,
    left: 14,
    borderLeftWidth: 6,
    borderTopWidth: 6,
  },
  qrCornerTopRight: {
    top: 14,
    right: 14,
    borderRightWidth: 6,
    borderTopWidth: 6,
  },
  qrCornerBottomLeft: {
    bottom: 14,
    left: 14,
    borderLeftWidth: 6,
    borderBottomWidth: 6,
  },
  qrCornerBottomRight: {
    bottom: 14,
    right: 14,
    borderRightWidth: 6,
    borderBottomWidth: 6,
  },
  qrCenterButton: {
    position: 'absolute',
    left: '13%',
    top: '13%',
    right: '13%',
    bottom: '13%',
    backgroundColor: '#111',
    opacity: 0.95,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  qrCenterButtonPressed: {
    opacity: 0.82,
  },
  qrCenterText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '800',
  },
  cameraButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 0,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  cameraIcon: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionLabel: {
    marginTop: 30,
    fontSize: 22,
    lineHeight: 28,
    textAlign: 'center',
    color: '#111',
  },
  dividerRow: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#D5E7ED',
  },
  dividerText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionHint: {
    marginTop: 22,
    textAlign: 'center',
    fontSize: 18,
    color: '#72879C',
  },
  inputShell: {
    marginTop: 24,
    minHeight: 78,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#BFEAF0',
    backgroundColor: colors.white,
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  input: {
    textAlign: 'center',
    fontSize: 20,
    color: colors.textStrong,
    letterSpacing: 1.2,
  },
  primaryButton: {
    marginTop: 30,
    minHeight: 78,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#58C9D7',
    marginBottom: 8,
  },
  primaryText: {
    color: colors.white,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
  },
  cameraScreen: {
    flex: 1,
    backgroundColor: '#081B22',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cameraCloseButton: {
    width: 52,
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  cameraCloseText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
  },
  cameraTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
    marginRight: 52,
  },
  cameraPreviewWrap: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2B6777',
    backgroundColor: '#000',
  },
  cameraPreview: {
    flex: 1,
  },
  cameraHint: {
    marginTop: 18,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  cameraDoneButton: {
    marginTop: 18,
    minHeight: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  cameraDoneText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
  },
});