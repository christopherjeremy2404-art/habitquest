import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const XP_MAX = 200;

const MISIONES_DEFAULT = [
  { id: 1, nombre: 'Entrenar 30 minutos', emoji: '💪', xp: 50, diff: 'med',  completada: false, default: true },
  { id: 2, nombre: 'Leer 20 minutos',     emoji: '📖', xp: 20, diff: 'easy', completada: false, default: true },
  { id: 3, nombre: 'Meditar',             emoji: '🧘', xp: 20, diff: 'easy', completada: false, default: true },
  { id: 4, nombre: 'No gastar de más',    emoji: '💎', xp: 50, diff: 'med',  completada: false, default: true },
  { id: 5, nombre: 'Dormir 8 horas',      emoji: '😴', xp: 20, diff: 'easy', completada: false, default: true },
  { id: 6, nombre: 'Estudiar 1 hora',     emoji: '📚', xp: 50, diff: 'med',  completada: false, default: true },
];

const XP_POR_DIFF = { easy: 20, med: 50, hard: 100 };

function getFechaHoy() {
  return new Date().toISOString().split('T')[0];
}

export default function MisionesScreen() {
  const [misiones, setMisiones]     = useState(MISIONES_DEFAULT);
  const [xp, setXp]                 = useState(0);
  const [nivel, setNivel]           = useState(1);
  const [xpActual, setXpActual]     = useState(0);
  const [racha, setRacha]           = useState(0);
  const [modal, setModal]           = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoEmoji, setNuevoEmoji]   = useState('⚡');
  const [nuevoDiff, setNuevoDiff]     = useState('easy');

  useEffect(() => {
    cargarDatos();
    configurarNotificaciones();
  }, []);

  async function configurarNotificaciones() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚡ HABITQUEST',
        body: '¡No olvides completar tus misiones de hoy, Héroe!',
        sound: true,
      },
      trigger: {
        hour: 7,
        minute: 0,
        repeats: true,
      },
    });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔥 ¡Tu racha está en riesgo!',
        body: 'Completa tus misiones antes de que termine el día.',
        sound: true,
      },
      trigger: {
        hour: 20,
        minute: 0,
        repeats: true,
      },
    });
  }

  async function cargarDatos() {
    try {
      const fechaGuardada = await AsyncStorage.getItem('fechaUltimoDia');
      const fechaHoy      = getFechaHoy();
      const xpG     = await AsyncStorage.getItem('xp');
      const nivelG  = await AsyncStorage.getItem('nivel');
      const xpActG  = await AsyncStorage.getItem('xpActual');
      const rachaG  = await AsyncStorage.getItem('racha');
      const misG    = await AsyncStorage.getItem('misiones');
      const misCustom = await AsyncStorage.getItem('misionesCustom');

      if (xpG)    setXp(parseInt(xpG));
      if (nivelG) setNivel(parseInt(nivelG));
      if (xpActG) setXpActual(parseInt(xpActG));

      if (fechaGuardada !== fechaHoy) {
        const misionesAyer = misG ? JSON.parse(misG) : [];
        const todasCompletas = misionesAyer.every(m => m.completada);
        let nuevaRacha = rachaG ? parseInt(rachaG) : 0;
        if (fechaGuardada) {
          nuevaRacha = todasCompletas ? nuevaRacha + 1 : 0;
        }
        setRacha(nuevaRacha);

        // Reiniciar misiones pero mantener las custom
        const custom = misCustom ? JSON.parse(misCustom) : [];
        const customReiniciadas = custom.map(m => ({ ...m, completada: false }));
        const todasMisiones = [...MISIONES_DEFAULT, ...customReiniciadas];

        setMisiones(todasMisiones);
        await AsyncStorage.setItem('racha', nuevaRacha.toString());
        await AsyncStorage.setItem('fechaUltimoDia', fechaHoy);
        await AsyncStorage.setItem('misiones', JSON.stringify(todasMisiones));
        await AsyncStorage.setItem('misionesCustom', JSON.stringify(customReiniciadas));
      } else {
        if (misG) setMisiones(JSON.parse(misG));
        if (rachaG) setRacha(parseInt(rachaG));
      }
    } catch (e) { console.log('Error:', e); }
  }

  async function completar(id, xpGanado, completada) {
    if (completada) return;
    const nuevasMisiones = misiones.map(m =>
      m.id === id ? { ...m, completada: true } : m
    );
    const nuevoXpTotal = xp + xpGanado;
    let nuevoNivel    = nivel;
    let nuevoXpActual = xpActual + xpGanado;
    if (nuevoXpActual >= XP_MAX) {
      nuevoNivel    = nivel + 1;
      nuevoXpActual = nuevoXpActual - XP_MAX;
    }
    setMisiones(nuevasMisiones);
    setXp(nuevoXpTotal);
    setNivel(nuevoNivel);
    setXpActual(nuevoXpActual);
    try {
      await AsyncStorage.setItem('xp',             nuevoXpTotal.toString());
      await AsyncStorage.setItem('nivel',          nuevoNivel.toString());
      await AsyncStorage.setItem('xpActual',       nuevoXpActual.toString());
      await AsyncStorage.setItem('misiones',       JSON.stringify(nuevasMisiones));
      await AsyncStorage.setItem('fechaUltimoDia', getFechaHoy());
    } catch (e) { console.log('Error:', e); }
  }

  async function eliminarMision(id) {
    const nuevasMisiones = misiones.filter(m => m.id !== id);
    const custom = nuevasMisiones.filter(m => !m.default);
    setMisiones(nuevasMisiones);
    await AsyncStorage.setItem('misiones', JSON.stringify(nuevasMisiones));
    await AsyncStorage.setItem('misionesCustom', JSON.stringify(custom));
  }

  async function agregarMision() {
    if (!nuevoNombre.trim()) return;
    const xpGanado = XP_POR_DIFF[nuevoDiff];
    const nueva = {
      id: Date.now(),
      nombre: nuevoNombre.trim(),
      emoji: nuevoEmoji,
      xp: xpGanado,
      diff: nuevoDiff,
      completada: false,
      default: false,
    };
    const nuevasMisiones = [...misiones, nueva];
    const custom = nuevasMisiones.filter(m => !m.default);
    setMisiones(nuevasMisiones);
    await AsyncStorage.setItem('misiones', JSON.stringify(nuevasMisiones));
    await AsyncStorage.setItem('misionesCustom', JSON.stringify(custom));
    setNuevoNombre('');
    setNuevoEmoji('⚡');
    setNuevoDiff('easy');
    setModal(false);
  }

  const porcentaje  = (xpActual / XP_MAX) * 100;
  const completadas = misiones.filter(m => m.completada).length;

  return (
    <ScrollView style={styles.fondo}>
      <Text style={styles.titulo}>⚡ MISIONES</Text>
      <Text style={styles.fecha}>// {getFechaHoy()}</Text>

      {/* NIVEL Y XP */}
      <View style={styles.nivelContainer}>
        <View style={styles.nivelRow}>
          <View style={styles.nivelBadge}>
            <Text style={styles.nivelLabel}>NVL</Text>
            <Text style={styles.nivelNum}>{nivel}</Text>
          </View>
          <View style={styles.xpInfo}>
            <View style={styles.xpLabelRow}>
              <Text style={styles.xpLabel}>// XP_PROGRESS</Text>
              <Text style={styles.xpLabel}>{xpActual} / {XP_MAX}</Text>
            </View>
            <View style={styles.barraFondo}>
              <View style={[styles.barraRelleno, { width: `${porcentaje}%` }]} />
            </View>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statVal}>{xp}</Text>
            <Text style={styles.statLabel}>XP TOTAL</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statVal}>{completadas}/{misiones.length}</Text>
            <Text style={styles.statLabel}>HOY</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statVal}>🔥 {racha}</Text>
            <Text style={styles.statLabel}>RACHA</Text>
          </View>
        </View>
      </View>

      {/* MISIONES */}
      <Text style={styles.seccion}>// MISIONES_DIARIAS</Text>
      {misiones.map((m) => (
        <TouchableOpacity
          key={m.id}
          style={[styles.carta, m.completada && styles.cartaDone]}
          onPress={() => completar(m.id, m.xp, m.completada)}
        >
          <Text style={styles.emoji}>{m.completada ? '✅' : m.emoji}</Text>
          <View style={styles.info}>
            <Text style={[styles.nombre, m.completada && styles.tachado]}>{m.nombre}</Text>
            <Text style={styles.xpTexto}>+{m.xp} XP</Text>
          </View>
          <View style={[styles.diffBadge,
            m.diff === 'easy' && styles.diffEasy,
            m.diff === 'med'  && styles.diffMed,
            m.diff === 'hard' && styles.diffHard,
          ]}>
            <Text style={styles.diffTexto}>
              {m.diff === 'easy' ? 'FÁCIL' : m.diff === 'med' ? 'MEDIA' : 'DIFÍCIL'}
            </Text>
          </View>
        {!m.default && (
            <TouchableOpacity
              onPress={() => eliminarMision(m.id)}
              style={styles.btnEliminar}
            >
              <Text style={styles.btnEliminarTexto}>✕</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      ))}

      {/* BOTÓN AGREGAR */}
      <TouchableOpacity style={styles.btnAgregar} onPress={() => setModal(true)}>
        <Text style={styles.btnAgregarTexto}>+ NUEVA MISIÓN</Text>
      </TouchableOpacity>

      {/* MODAL */}
      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitulo}>// NUEVA_MISIÓN</Text>

            <Text style={styles.modalLabel}>EMOJI</Text>
            <TextInput
              style={styles.input}
              value={nuevoEmoji}
              onChangeText={setNuevoEmoji}
              maxLength={2}
            />

            <Text style={styles.modalLabel}>NOMBRE</Text>
            <TextInput
              style={styles.input}
              placeholder="ej. Tomar agua..."
              placeholderTextColor="#5a5080"
              value={nuevoNombre}
              onChangeText={setNuevoNombre}
            />

            <Text style={styles.modalLabel}>DIFICULTAD</Text>
            <View style={styles.diffRow}>
              {['easy','med','hard'].map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.diffBtn, nuevoDiff === d && styles.diffBtnActive]}
                  onPress={() => setNuevoDiff(d)}
                >
                  <Text style={styles.diffBtnTexto}>
                    {d === 'easy' ? '🟢 FÁCIL' : d === 'med' ? '🔵 MEDIA' : '🔴 DIFÍCIL'}
                  </Text>
                  <Text style={styles.diffBtnXp}>+{XP_POR_DIFF[d]} XP</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.btnCancelar} onPress={() => setModal(false)}>
                <Text style={styles.btnCancelarTexto}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnConfirmar} onPress={agregarMision}>
                <Text style={styles.btnConfirmarTexto}>CONFIRMAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: '#04040d', padding: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#00d4ff', letterSpacing: 4, marginTop: 50, marginBottom: 2 },
  fecha: { fontSize: 10, color: '#5a5080', fontFamily: 'monospace', letterSpacing: 2, marginBottom: 16 },
  nivelContainer: { backgroundColor: '#0d0d22', borderWidth: 1, borderColor: '#1a1a35', borderRadius: 12, padding: 14, marginBottom: 20 },
  nivelRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  nivelBadge: { backgroundColor: '#1a1a35', borderWidth: 1, borderColor: '#b44eff', borderRadius: 8, padding: 8, alignItems: 'center', minWidth: 50 },
  nivelLabel: { fontSize: 9, color: '#b44eff', letterSpacing: 2, fontFamily: 'monospace' },
  nivelNum: { fontSize: 22, fontWeight: 'bold', color: '#00d4ff' },
  xpInfo: { flex: 1 },
  xpLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  xpLabel: { fontSize: 10, color: '#5a5080', fontFamily: 'monospace', letterSpacing: 1 },
  barraFondo: { height: 8, backgroundColor: '#1a1a35', borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: '#2a2a45' },
  barraRelleno: { height: '100%', backgroundColor: '#00d4ff', borderRadius: 4 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statChip: { flex: 1, backgroundColor: '#04040d', borderWidth: 1, borderColor: '#1a1a35', borderRadius: 8, padding: 8, alignItems: 'center' },
  statVal: { fontSize: 14, fontWeight: 'bold', color: '#00d4ff', fontFamily: 'monospace' },
  statLabel: { fontSize: 8, color: '#5a5080', letterSpacing: 1, marginTop: 2 },
  seccion: { fontSize: 10, color: '#00d4ff', letterSpacing: 3, marginBottom: 10, fontFamily: 'monospace' },
  carta: { backgroundColor: '#0d0d22', borderWidth: 1, borderColor: '#1a1a35', borderRadius: 10, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  cartaDone: { borderColor: '#39ff14', opacity: 0.7 },
  emoji: { fontSize: 26 },
  info: { flex: 1 },
  nombre: { fontSize: 14, color: '#e0d8f0', fontWeight: '600' },
  tachado: { textDecorationLine: 'line-through', opacity: 0.5 },
  xpTexto: { fontSize: 10, color: '#00d4ff', marginTop: 3, fontFamily: 'monospace' },
  diffBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3, borderWidth: 1 },
  diffEasy: { backgroundColor: 'rgba(57,255,20,0.1)',  borderColor: '#39ff14' },
  diffMed:  { backgroundColor: 'rgba(0,212,255,0.1)',  borderColor: '#00d4ff' },
  diffHard: { backgroundColor: 'rgba(255,45,120,0.1)', borderColor: '#ff2d78' },
  diffTexto: { fontSize: 8, color: '#e0d8f0', fontFamily: 'monospace', letterSpacing: 1 },

  btnEliminar: { padding: 6, marginLeft: 4 },
  btnEliminarTexto: { color: '#ff2d78', fontSize: 14, fontWeight: 'bold' },
  btnAgregar: { backgroundColor: '#0d0d22', borderWidth: 1, borderColor: '#00d4ff', borderStyle: 'dashed', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 4, marginBottom: 30 },
  btnAgregarTexto: { color: '#00d4ff', fontFamily: 'monospace', fontSize: 12, letterSpacing: 2 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#0a0a1a', borderTopWidth: 1, borderColor: '#00d4ff', borderRadius: 20, padding: 24, paddingBottom: 40 },
  modalTitulo: { fontSize: 13, fontWeight: 'bold', color: '#00d4ff', letterSpacing: 2, fontFamily: 'monospace', marginBottom: 20 },
  modalLabel: { fontSize: 9, color: '#5a5080', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 6 },
  input: { backgroundColor: '#04040d', borderWidth: 1, borderColor: '#2a2a45', borderRadius: 8, padding: 10, color: '#e0d8f0', fontSize: 14, marginBottom: 14 },

  diffRow: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  diffBtn: { flex: 1, backgroundColor: '#04040d', borderWidth: 1, borderColor: '#2a2a45', borderRadius: 8, padding: 8, alignItems: 'center' },
  diffBtnActive: { borderColor: '#00d4ff', backgroundColor: 'rgba(0,212,255,0.1)' },
  diffBtnTexto: { fontSize: 10, color: '#e0d8f0', fontFamily: 'monospace' },
  diffBtnXp: { fontSize: 9, color: '#5a5080', fontFamily: 'monospace', marginTop: 2 },

  modalBtns: { flexDirection: 'row', gap: 10 },
  btnCancelar: { flex: 1, backgroundColor: 'none', borderWidth: 1, borderColor: '#2a2a45', borderRadius: 8, padding: 12, alignItems: 'center' },
  btnCancelarTexto: { color: '#5a5080', fontFamily: 'monospace', fontSize: 10, letterSpacing: 1 },
  btnConfirmar: { flex: 1, backgroundColor: 'rgba(0,212,255,0.15)', borderWidth: 1, borderColor: '#00d4ff', borderRadius: 8, padding: 12, alignItems: 'center' },
  btnConfirmarTexto: { color: '#00d4ff', fontFamily: 'monospace', fontSize: 10, letterSpacing: 1, fontWeight: 'bold' },
});