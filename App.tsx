import { StatusBar } from 'expo-status-bar';
import { AudioModule, RecordingPresets, useAudioRecorder } from 'expo-audio';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Language = {
  code: string;
  name: string;
  flag: string;
};

const AUTO_DETECT: Language = { code: 'auto', name: 'Auto-detect', flag: '✨' };

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
];

const SAMPLE_TRANSCRIPT = 'Welcome to the live caption demo.';
const SAMPLE_TRANSLATION = 'Bienvenido a la demostración de subtítulos en vivo.';

export default function App() {
  const [sourceLanguage, setSourceLanguage] = useState(AUTO_DETECT);
  const [targetLanguage, setTargetLanguage] = useState(LANGUAGES[1]);
  const [hasPermission, setHasPermission] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState<'source' | 'target' | null>(null);
  const [transcript, setTranscript] = useState('');
  const [translation, setTranslation] = useState('');
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  useEffect(() => {
    return () => {
      if (isListening) {
        recorder.stop();
      }
    };
  }, [isListening, recorder]);

  async function startRecording() {
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      setHasPermission(permission.granted);

      if (!permission.granted) {
        Alert.alert(
          'Microphone access needed',
          'Allow microphone access in Settings to use live captions.',
        );
        return;
      }

      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsListening(true);
      setTranscript('');
      setTranslation('');

      setTimeout(() => {
        setTranscript(SAMPLE_TRANSCRIPT);
        setTranslation(SAMPLE_TRANSLATION);
      }, 900);
    } catch (error) {
      setIsListening(false);
      Alert.alert(
        'Unable to start recording',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  }

  async function stopRecording() {
    if (!isListening) {
      return;
    }

    try {
      recorder.stop();
    } finally {
      setIsListening(false);
    }
  }

  const selectedLanguage = showLanguagePicker === 'source' ? sourceLanguage : targetLanguage;

  function chooseLanguage(language: Language) {
    if (showLanguagePicker === 'source') {
      setSourceLanguage(language);
    } else {
      setTargetLanguage(language);
    }
    setShowLanguagePicker(null);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>LIVE CAPTION</Text>
            <Text style={styles.title}>Speak freely.</Text>
          </View>
          <View style={[styles.statusPill, isListening && styles.statusPillActive]}>
            <View style={[styles.statusDot, isListening && styles.statusDotActive]} />
            <Text style={[styles.statusText, isListening && styles.statusTextActive]}>
              {isListening ? 'LISTENING' : 'READY'}
            </Text>
          </View>
        </View>

        <View style={styles.languageRow}>
          <LanguageButton
            label="Spoken language"
            language={sourceLanguage}
            onPress={() => setShowLanguagePicker('source')}
          />
          <Text style={styles.arrow}>→</Text>
          <LanguageButton
            label="Translate to"
            language={targetLanguage}
            onPress={() => setShowLanguagePicker('target')}
          />
        </View>

        <View style={styles.captionCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>TRANSCRIPT</Text>
            {isListening && <Text style={styles.liveLabel}>● LIVE</Text>}
          </View>
          <Text style={[styles.transcriptText, !transcript && styles.placeholderText]}>
            {transcript || 'Your words will appear here…'}
          </Text>
        </View>

        <View style={styles.translationCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>TRANSLATED CAPTION</Text>
            <Text style={styles.languageCode}>{targetLanguage.code.toUpperCase()}</Text>
          </View>
          <Text style={[styles.translationText, !translation && styles.placeholderText]}>
            {translation || 'Translation will appear here…'}
          </Text>
        </View>

        <View style={styles.spacer} />

        <View style={styles.micArea}>
          <Text style={styles.helperText}>
            {isListening
              ? sourceLanguage.code === 'auto'
                ? 'Detecting language and listening'
                : `Listening in ${sourceLanguage.name}`
              : 'Tap the microphone to begin'}
          </Text>
          <Pressable
            accessibilityLabel={isListening ? 'Stop recording' : 'Start recording'}
            accessibilityRole="button"
            onPress={isListening ? stopRecording : startRecording}
            style={({ pressed }) => [
              styles.micButton,
              isListening && styles.micButtonActive,
              pressed && styles.micButtonPressed,
            ]}
          >
            <Text style={styles.micIcon}>{isListening ? '■' : '●'}</Text>
          </Pressable>
          <Text style={styles.permissionText}>
            {hasPermission ? 'Microphone enabled' : 'Microphone permission required'}
          </Text>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={showLanguagePicker !== null}
        onRequestClose={() => setShowLanguagePicker(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowLanguagePicker(null)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>
              {showLanguagePicker === 'source'
                ? 'Spoken language'
                : 'Caption language'}
            </Text>
            <FlatList
              data={showLanguagePicker === 'source' ? [AUTO_DETECT, ...LANGUAGES] : LANGUAGES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => chooseLanguage(item)}
                  style={styles.languageOption}
                >
                  <Text style={styles.flag}>{item.flag}</Text>
                  <Text style={styles.optionName}>{item.name}</Text>
                  {item.code === selectedLanguage.code && <Text style={styles.check}>✓</Text>}
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function LanguageButton({
  label,
  language,
  onPress,
}: {
  label: string;
  language: Language;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${language.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.languageButton, pressed && styles.buttonPressed]}
    >
      <Text style={styles.languageLabel}>{label}</Text>
      <View style={styles.languageValue}>
        <Text style={styles.flag}>{language.flag}</Text>
        <Text style={styles.languageName}>{language.name}</Text>
        <Text style={styles.chevron}>⌄</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F8F5' },
  container: { flex: 1, paddingHorizontal: 22, paddingTop: 16, paddingBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow: { color: '#72806E', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  title: { color: '#17251D', fontSize: 34, fontWeight: '800', letterSpacing: -1.2, marginTop: 5 },
  statusPill: {
    alignItems: 'center',
    backgroundColor: '#E8ECE7',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 7,
    marginTop: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusPillActive: { backgroundColor: '#E0F2E6' },
  statusDot: { backgroundColor: '#88928A', borderRadius: 4, height: 7, width: 7 },
  statusDotActive: { backgroundColor: '#28A65A' },
  statusText: { color: '#72806E', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  statusTextActive: { color: '#22884A' },
  languageRow: { alignItems: 'center', flexDirection: 'row', marginTop: 30 },
  languageButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E7E1',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    padding: 13,
  },
  buttonPressed: { opacity: 0.72 },
  languageLabel: { color: '#8A948B', fontSize: 11, fontWeight: '700', marginBottom: 7 },
  languageValue: { alignItems: 'center', flexDirection: 'row' },
  flag: { fontSize: 20, marginRight: 8 },
  languageName: { color: '#26352B', flex: 1, fontSize: 15, fontWeight: '700' },
  chevron: { color: '#8A948B', fontSize: 17 },
  arrow: { color: '#A3ADA4', fontSize: 20, marginHorizontal: 9 },
  captionCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E7E1',
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 22,
    minHeight: 144,
    padding: 20,
  },
  translationCard: {
    backgroundColor: '#E8F3EB',
    borderRadius: 22,
    marginTop: 12,
    minHeight: 144,
    padding: 20,
  },
  cardHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  cardLabel: { color: '#839087', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  liveLabel: { color: '#2BA55C', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  languageCode: { color: '#679176', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  transcriptText: { color: '#213128', fontSize: 23, fontWeight: '600', lineHeight: 31, marginTop: 20 },
  translationText: { color: '#214C31', fontSize: 23, fontWeight: '700', lineHeight: 31, marginTop: 20 },
  placeholderText: { color: '#AAB3AC', fontWeight: '500' },
  spacer: { flex: 1 },
  micArea: { alignItems: 'center', paddingBottom: 5 },
  helperText: { color: '#6E7A71', fontSize: 13, marginBottom: 15 },
  micButton: {
    alignItems: 'center',
    backgroundColor: '#1D7F45',
    borderColor: '#C4E1CB',
    borderRadius: 43,
    borderWidth: 7,
    elevation: 3,
    height: 86,
    justifyContent: 'center',
    shadowColor: '#1D7F45',
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    width: 86,
  },
  micButtonActive: { backgroundColor: '#C44343', borderColor: '#F2D1D1' },
  micButtonPressed: { opacity: 0.82, transform: [{ scale: 0.96 }] },
  micIcon: { color: '#FFFFFF', fontSize: 27 },
  permissionText: { color: '#98A29A', fontSize: 11, marginTop: 12 },
  modalBackdrop: { backgroundColor: 'rgba(20, 32, 24, 0.35)', flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '65%',
    padding: 22,
  },
  sheetHandle: { alignSelf: 'center', backgroundColor: '#D5DBD5', borderRadius: 3, height: 5, marginBottom: 20, width: 42 },
  sheetTitle: { color: '#17251D', fontSize: 22, fontWeight: '800', marginBottom: 12 },
  languageOption: { alignItems: 'center', borderBottomColor: '#EDF0ED', borderBottomWidth: 1, flexDirection: 'row', paddingVertical: 16 },
  optionName: { color: '#26352B', flex: 1, fontSize: 16, fontWeight: '600' },
  check: { color: '#1D7F45', fontSize: 22, fontWeight: '700' },
});
