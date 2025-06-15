import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  stats: { flexDirection: 'row', justifyContent: 'space-around', padding: 16 },
  statsText: { fontSize: 16, fontWeight: '600' },
  filterRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 8 },
  form: { paddingHorizontal: 16, marginBottom: 16 },
  input: { marginVertical: 8 },
  pickerWrap: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fff', marginVertical: 8 },
  addBtn: { marginTop: 16 },
  list: { paddingBottom: 80 },
  card: { marginHorizontal: 16, marginVertical: 8 },
  actions: { flexDirection: 'row' },
  modalBox: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 8 },
  modalText: { fontSize: 18, marginBottom: 16, textAlign: 'center' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-around' },
});
