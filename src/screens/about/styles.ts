import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appLogo: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  headerTexts: {
    flex: 1,
    marginLeft: 16,
  },
  appName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  heading: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 4,
  },
  text: {
    color: '#9a9ca5',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  tokenStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  tokenStatusText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  input: {
    marginTop: 12,
    height: 52,
    backgroundColor: '#1c1e25',
    borderRadius: 14,
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 15,
  },
  tokenButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  saveButton: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: '#a8c7fa',
  },
  saveText: {
    color: '#121318',
    fontWeight: 'bold',
  },
  removeButton: {
    height: 48,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: '#2c2e36',
  },
  removeText: {
    color: '#f28b82',
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.7,
  },
  okText: {
    color: '#a8c7fa',
    marginTop: 8,
  },
  errorText: {
    color: '#f28b82',
    marginTop: 8,
  },
  tmdbLogo: {
    height: 20,
    width: 150,
    marginTop: 8,
  },
});
