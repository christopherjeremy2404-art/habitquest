import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function FinanzasScreen() {
  const [balance, setBalance]             = useState(0);
  const [ingresos, setIngresos]           = useState(0);
  const [gastos, setGastos]               = useState(0);
  const [transacciones, setTransacciones] = useState([]);
  const [monto, setMonto]                 = useState('');
  const [descripcion, setDescripcion]     = useState('');

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    try {
      const balG = await AsyncStorage.getItem('finBalance');
      const incG = await AsyncStorage.getItem('finIngresos');
      const gasG = await AsyncStorage.getItem('finGastos');
      const txG  = await AsyncStorage.getItem('finTransacciones');
      if (balG) setBalance(parseFloat(balG));
      if (incG) setIngresos(parseFloat(incG));
      if (gasG) setGastos(parseFloat(gasG));
      if (txG)  setTransacciones(JSON.parse(txG));
    } catch (e) { console.log('Error:', e); }
  }

  async function agregar(tipo) {
    if (!monto || !descripcion) return;
    const valor = parseFloat(monto);
    if (isNaN(valor) || valor <= 0) return;
    const nueva = {
      id: Date.now().toString(),
      tipo, monto: valor, descripcion,
      fecha: new Date().toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' }),
    };
    const nuevasTx      = [nueva, ...transacciones];
    const nuevoBalance  = tipo === 'ingreso' ? balance + valor : balance - valor;
    const nuevoIngresos = tipo === 'ingreso' ? ingresos + valor : ingresos;
    const nuevoGastos   = tipo === 'gasto'   ? gastos + valor   : gastos;
    setTransacciones(nuevasTx);
    setBalance(nuevoBalance);
    setIngresos(nuevoIngresos);
    setGastos(nuevoGastos);
    setMonto(''); setDescripcion('');
    try {
      await AsyncStorage.setItem('finBalance',       nuevoBalance.toString());
      await AsyncStorage.setItem('finIngresos',      nuevoIngresos.toString());
      await AsyncStorage.setItem('finGastos',        nuevoGastos.toString());
      await AsyncStorage.setItem('finTransacciones', JSON.stringify(nuevasTx));
    } catch (e) { console.log('Error:', e); }
  }

  async function eliminarTransaccion(id) {
    const tx = transacciones.find(t => t.id === id);
    if (!tx) return;
    const nuevasTx      = transacciones.filter(t => t.id !== id);
    const nuevoBalance  = tx.tipo === 'ingreso' ? balance - tx.monto : balance + tx.monto;
    const nuevoIngresos = tx.tipo === 'ingreso' ? ingresos - tx.monto : ingresos;
    const nuevoGastos   = tx.tipo === 'gasto'   ? gastos - tx.monto   : gastos;
    setTransacciones(nuevasTx);
    setBalance(nuevoBalance);
    setIngresos(nuevoIngresos);
    setGastos(nuevoGastos);
    try {
      await AsyncStorage.setItem('finBalance',       nuevoBalance.toString());
      await AsyncStorage.setItem('finIngresos',      nuevoIngresos.toString());
      await AsyncStorage.setItem('finGastos',        nuevoGastos.toString());
      await AsyncStorage.setItem('finTransacciones', JSON.stringify(nuevasTx));
    } catch (e) { console.log('Error:', e); }
  }

  return (
    <ScrollView style={styles.fondo}>
      <Text style={styles.titulo}>💎 CRÉDITOS</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>// BALANCE_TOTAL</Text>
        <Text style={[styles.balanceNum, balance < 0 && styles.negativo]}>
          ${balance.toFixed(2)}
        </Text>
        <View style={styles.balanceRow}>
          <View style={styles.balanceChip}>
            <Text style={styles.chipLabel}>⬆ INGRESOS</Text>
            <Text style={styles.chipInc}>${ingresos.toFixed(2)}</Text>
          </View>
          <View style={styles.balanceChip}>
            <Text style={styles.chipLabel}>⬇ GASTOS</Text>
            <Text style={styles.chipExp}>${gastos.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.seccion}>// NUEVA_TRANSACCIÓN</Text>
        <TextInput
          style={styles.input}
          placeholder="Descripción..."
          placeholderTextColor="#5a5080"
          value={descripcion}
          onChangeText={setDescripcion}
        />
        <TextInput
          style={styles.input}
          placeholder="Monto..."
          placeholderTextColor="#5a5080"
          value={monto}
          onChangeText={setMonto}
          keyboardType="numeric"
        />
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.btnIngreso} onPress={() => agregar('ingreso')}>
            <Text style={styles.btnTexto}>⬆ INGRESO</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnGasto} onPress={() => agregar('gasto')}>
            <Text style={styles.btnTexto}>⬇ GASTO</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.seccion}>// HISTORIAL</Text>
      {transacciones.length === 0 && (
        <Text style={styles.vacio}>// SIN_TRANSACCIONES</Text>
      )}
      {transacciones.map((t) => (
        <View key={t.id} style={[styles.txItem, t.tipo === 'ingreso' ? styles.txInc : styles.txExp]}>
          <View style={styles.txIcono}>
            <Text style={{ fontSize: 18 }}>{t.tipo === 'ingreso' ? '⬆️' : '⬇️'}</Text>
          </View>
          <View style={styles.txInfo}>
            <Text style={styles.txDesc}>{t.descripcion}</Text>
            <Text style={styles.txFecha}>{t.fecha}</Text>
          </View>
          <Text style={[styles.txMonto, t.tipo === 'ingreso' ? styles.incTexto : styles.expTexto]}>
            {t.tipo === 'ingreso' ? '+' : '-'}${t.monto.toFixed(2)}
          </Text>
          <TouchableOpacity onPress={() => eliminarTransaccion(t.id)} style={styles.btnX}>
            <Text style={styles.btnXTexto}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: '#04040d', padding: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#00d4ff', letterSpacing: 4, marginTop: 50, marginBottom: 16 },
  balanceCard: { backgroundColor: '#0d0d22', borderWidth: 1, borderColor: '#ff2d78', borderRadius: 12, padding: 16, marginBottom: 16 },
  balanceLabel: { fontSize: 10, color: '#5a5080', fontFamily: 'monospace', letterSpacing: 2, marginBottom: 4 },
  balanceNum: { fontSize: 32, fontWeight: 'bold', color: '#00d4ff', marginBottom: 12 },
  negativo: { color: '#ff2d78' },
  balanceRow: { flexDirection: 'row', gap: 8 },
  balanceChip: { flex: 1, backgroundColor: '#04040d', borderWidth: 1, borderColor: '#1a1a35', borderRadius: 8, padding: 10 },
  chipLabel: { fontSize: 9, color: '#5a5080', fontFamily: 'monospace', letterSpacing: 1 },
  chipInc: { fontSize: 16, fontWeight: 'bold', color: '#39ff14', marginTop: 2 },
  chipExp: { fontSize: 16, fontWeight: 'bold', color: '#ff2d78', marginTop: 2 },
  form: { backgroundColor: '#0d0d22', borderWidth: 1, borderColor: '#1a1a35', borderRadius: 12, padding: 14, marginBottom: 16 },
  seccion: { fontSize: 10, color: '#00d4ff', letterSpacing: 3, marginBottom: 10, fontFamily: 'monospace' },
  input: { backgroundColor: '#04040d', borderWidth: 1, borderColor: '#2a2a45', borderRadius: 8, padding: 10, color: '#e0d8f0', fontSize: 14, marginBottom: 8 },
  btnRow: { flexDirection: 'row', gap: 8 },
  btnIngreso: { flex: 1, backgroundColor: 'rgba(57,255,20,0.08)', borderWidth: 1, borderColor: '#39ff14', borderRadius: 8, padding: 12, alignItems: 'center' },
  btnGasto: { flex: 1, backgroundColor: 'rgba(255,45,120,0.08)', borderWidth: 1, borderColor: '#ff2d78', borderRadius: 8, padding: 12, alignItems: 'center' },
  btnTexto: { color: '#e0d8f0', fontWeight: 'bold', fontSize: 12, letterSpacing: 2, fontFamily: 'monospace' },
  vacio: { textAlign: 'center', color: '#5a5080', fontFamily: 'monospace', fontSize: 12, padding: 20 },
  txItem: { borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1 },
  txInc: { backgroundColor: 'rgba(57,255,20,0.05)', borderColor: 'rgba(57,255,20,0.2)' },
  txExp: { backgroundColor: 'rgba(255,45,120,0.05)', borderColor: 'rgba(255,45,120,0.2)' },
  txIcono: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#04040d', alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 14, color: '#e0d8f0', fontWeight: '600' },
  txFecha: { fontSize: 10, color: '#5a5080', marginTop: 2, fontFamily: 'monospace' },
  txMonto: { fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace' },
  incTexto: { color: '#39ff14' },
  expTexto: { color: '#ff2d78' },
  btnX: { padding: 4 },
  btnXTexto: { color: '#ff2d78', fontSize: 16, fontWeight: 'bold' },
});