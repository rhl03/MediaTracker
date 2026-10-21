import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { useTmdbToken } from './useTmdbToken';
import { styles } from './styles';
import { LinkRow } from './components/LinkRow';

type Props = NativeStackScreenProps<RootStackParamList, 'About'>;

const REPO_URL = 'https://github.com/rhl03/MediaTracker';
const TMDB_API_SETTINGS_URL = 'https://www.themoviedb.org/settings/api';
const KOTATSU_REDO_URL = 'https://github.com/Kotatsu-Redo/Kotatsu-Redo';

export function AboutScreen(_props: Props): React.JSX.Element {
  const {
    input,
    setInput,
    hasToken,
    state,
    saveToken,
    removeToken,
    saveDisabled,
  } = useTmdbToken();

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.appLogo}
        />
        <View style={styles.headerTexts}>
          <Text style={styles.appName}>Media Tracker</Text>
          <Text style={styles.text}>
            Track the movies, series and anime you watch.
          </Text>
        </View>
      </View>

      <Text style={styles.heading}>TMDB token</Text>
      <Text style={styles.text}>
        Media Tracker uses your own free TMDB API Read Access Token. It is
        stored only on this phone.
      </Text>

      <View style={styles.tokenStatus}>
        <MaterialIcons
          name={hasToken ? 'check-circle' : 'error-outline'}
          size={18}
          color={hasToken ? '#a8c7fa' : '#f28b82'}
        />
        <Text style={styles.tokenStatusText}>
          {hasToken ? 'Token saved' : 'No token yet'}
        </Text>
      </View>

      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="Paste your API Read Access Token"
        placeholderTextColor="#6b6d76"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.tokenButtons}>
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            saveDisabled && styles.buttonDisabled,
            pressed && styles.pressed,
          ]}
          onPress={saveToken}
          disabled={saveDisabled}
        >
          {state.kind === 'checking' ? (
            <ActivityIndicator color="#121318" />
          ) : (
            <Text style={styles.saveText}>Save token</Text>
          )}
        </Pressable>
        {hasToken && (
          <Pressable
            style={({ pressed }) => [
              styles.removeButton,
              pressed && styles.pressed,
            ]}
            onPress={removeToken}
          >
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        )}
      </View>

      {state.kind === 'saved' && (
        <Text style={styles.okText}>Token checked and saved.</Text>
      )}
      {state.kind === 'removed' && (
        <Text style={styles.text}>Token removed.</Text>
      )}
      {state.kind === 'error' && (
        <Text style={styles.errorText}>{state.message}</Text>
      )}

      <LinkRow
        icon="vpn-key"
        label="Get a token on themoviedb.org"
        url={TMDB_API_SETTINGS_URL}
      />

      <Text style={styles.heading}>Source code</Text>
      <LinkRow
        icon="code"
        label={REPO_URL.replace('https://', '')}
        url={REPO_URL}
      />

      <Text style={styles.heading}>Credits</Text>
      <Image
        source={require('../../../assets/tmdb-logo.png')}
        style={styles.tmdbLogo}
        resizeMode="contain"
      />
      <Text style={styles.text}>
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </Text>

      <Text style={styles.text}>
        UI design inspired by Kotatsu-Redo, a fork of Kotatsu.
      </Text>
      <LinkRow
        icon="palette"
        label="Kotatsu-Redo on GitHub"
        url={KOTATSU_REDO_URL}
      />
    </ScrollView>
  );
}
