import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const RANGOS = [
  { nombre: 'NOVATO',       minNivel: 1,    color: '#39ff14', emoji: '🟢' },
  { nombre: 'OPERADOR',     minNivel: 21,   color: '#00d4ff', emoji: '🔵' },
  { nombre: 'TÉCNICO',      minNivel: 51,   color: '#b44eff', emoji: '💜' },
  { nombre: 'HACKER',       minNivel: 101,  color: '#ff2d78', emoji: '🩷' },
  { nombre: 'RUNNER',       minNivel: 201,  color: '#ffb300', emoji: '⚡' },
  { nombre: 'CYBORG',       minNivel: 301,  color: '#00ffcc', emoji: '🤖' },
  { nombre: 'ELITE TECH',   minNivel: 451,  color: '#00d4ff', emoji: '💎' },
  { nombre: 'NEXUS',        minNivel: 601,  color: '#7c4dff', emoji: '🌐' },
  { nombre: 'OMEGA',        minNivel: 751,  color: '#ff2d78', emoji: '👑' },
  { nombre: 'SINGULARIDAD', minNivel: 1000, color: '#ffffff', emoji: '✨' },
];

function getRango(nivel) {
  let rango = RANGOS[0];
  for (const r of RANGOS) {
    if (nivel >= r.minNivel) rango = r;
  }
  return rango;
}

export default function PerfilScreen() {
  const [personaje, setPersonaje] = useState(null);
  const [nivel, setNivel]         = useState(1);
  const [xp, setXp]               = useState(0);
  const [racha, setRacha]         = useState(0);
  const [balance, setBalance]     = useState(0);
  const [ingresos, setIngresos]   = useState(0);
  const [gastos, setGastos]       = useState(0);
  const router = useRouter();

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    try {
      const p   = await AsyncStorage.getItem('personaje');
      const n   = await AsyncStorage.getItem('nivel');
      const x   = await AsyncStorage.getItem('xp');
      const r   = await AsyncStorage.getItem('racha');
      const b   = await AsyncStorage.getItem('finBalance');
      const inc = await AsyncStorage.getItem('finIngresos');
      const gas = await AsyncStorage.getItem('finGastos');

      if (p)   setPersonaje(JSON.parse(p));
      if (n)   setNivel(parseInt(n));
      if (x)   setXp(parseInt(x));
      if (r)   setRacha(parseInt(r));
      if (b)   setBalance(parseFloat(b));
      if (inc) setIngresos(parseFloat(inc));
      if (gas) setGastos(parseFloat(gas));
    } catch (e) { console.log('Error:', e); }
  }

  async function cambiarPersonaje() {
    await AsyncStorage.removeItem('personaje');
    router.replace('/(tabs)');
  }

  const rango = getRango(nivel);

  return (
    <ScrollView style={styles.fondo}>
      <Text style={styles.titulo}>🛡️ PERFIL</Text>

      {/* AVATAR */}
      <View style={[styles.avatarCard, { borderColor: rango.color }]}>
        <View style={[styles.avatarCirculo, { borderColor: rango.color, shadowColor: rango.color }]}>
          <Text style={styles.avatarEmoji}>
            {personaje ? personaje.emoji : '👾'}
          </Text>
        </View>
        <Text style={[styles.avatarNombre, { color: rango.color }]}>
          {personaje ? personaje.nombre : 'HÉROE'}
        </Text>
        <Text style={styles.avatarRol}>
          {personaje ? personaje.rol : '// SIN CLASE'}
        </Text>
        <View style={[styles.rangoBadge, { borderColor: rango.color, backgroundColor: rango.color + '22' }]}>
          <Text style={styles.rangoEmoji}>{rango.emoji}</Text>
          <Text style={[styles.rangoNombre, { color: rango.color }]}>{rango.nombre}</Text>
        </View>
      </View>

      {/* STATS */}
      <Text style={styles.seccion}>// ESTADÍSTICAS</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{nivel}</Text>
          <Text style={styles.statLabel}>NIVEL</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{xp.toLocaleString()}</Text>
          <Text style={styles.statLabel}>XP TOTAL</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>🔥{racha}</Text>
          <Text style={styles.statLabel}>RACHA</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, balance < 0 && { color: '#ff2d78' }]}>
            ${balance.toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>BALANCE</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: '#39ff14' }]}>${ingresos.toFixed(0)}</Text>
          <Text style={styles.statLabel}>INGRESOS</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: '#ff2d78' }]}>${gastos.toFixed(0)}</Text>
          <Text style={styles.statLabel}>GASTOS</Text>
        </View>
      </View>

      {/* RANGOS */}
      <Text style={styles.seccion}>// TABLA DE RANGOS</Text>
      {RANGOS.map((r, i) => (
        <View key={i} style={[
          styles.rangoItem,
          nivel >= r.minNivel ? { borderColor: r.color } : { opacity: 0.35 },
        ]}>
          <Text style={styles.rangoItemEmoji}>{r.emoji}</Text>
          <View style={styles.rangoItemInfo}>
            <Text style={[styles.rangoItemNombre, nivel >= r.minNivel && { color: r.color }]}>
              {r.nombre}
            </Text>
            <Text style={styles.rangoItemReq}>Nivel {r.minNivel}+</Text>
          </View>
          {nivel >= r.minNivel
            ? <Text style={[styles.rangoStatus, { color: r.color, borderColor: r.color }]}>✓ OK</Text>
            : <Text style={styles.rangoStatusLock}>🔒</Text>
          }
        </View>
      ))}

      {/* CAMBIAR PERSONAJE */}
      <TouchableOpacity style={styles.btnCambiar} onPress={cambiarPersonaje}>
        <Text style={styles.btnCambiarTexto}>⚙️ CAMBIAR PERSONAJE</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: '#04040d', padding: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#00d4ff', letterSpacing: 4, marginTop: 50, marginBottom: 16 },
  avatarCard: { backgroundColor: '#0d0d22', borderWidth: 1, borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 20 },
  avatarCirculo: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, backgroundColor: '#04040d', alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowOpacity: 0.6, shadowRadius: 15, elevation: 8 },
  avatarEmoji: { fontSize: 44 },
  avatarNombre: { fontSize: 20, fontWeight: 'bold', letterSpacing: 3, fontFamily: 'monospace', marginBottom: 4 },
  avatarRol: { fontSize: 11, color: '#5a5080', fontFamily: 'monospace', letterSpacing: 2, marginBottom: 12 },
  rangoBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 5 },
  rangoEmoji: { fontSize: 14 },
  rangoNombre: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: 1 },
  seccion: { fontSize: 10, color: '#00d4ff', letterSpacing: 3, marginBottom: 10, fontFamily: 'monospace' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  statBox: { width: '30.5%', backgroundColor: '#0d0d22', borderWidth: 1, borderColor: '#1a1a35', borderRadius: 10, padding: 12, alignItems: 'center' },
  statNum: { fontSize: 16, fontWeight: 'bold', color: '#00d4ff', fontFamily: 'monospace' },
  statLabel: { fontSize: 8, color: '#5a5080', letterSpacing: 1, marginTop: 4, fontFamily: 'monospace' },
  rangoItem: { backgroundColor: '#0d0d22', borderWidth: 1, borderColor: '#1a1a35', borderRadius: 8, padding: 12, marginBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 10 },
  rangoItemEmoji: { fontSize: 20 },
  rangoItemInfo: { flex: 1 },
  rangoItemNombre: { fontSize: 12, color: '#e0d8f0', fontFamily: 'monospace', letterSpacing: 1, fontWeight: 'bold' },
  rangoItemReq: { fontSize: 10, color: '#5a5080', fontFamily: 'monospace', marginTop: 2 },
  rangoStatus: { fontSize: 9, fontFamily: 'monospace', borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  rangoStatusLock: { fontSize: 14 },
  btnCambiar: { backgroundColor: 'rgba(255,45,120,0.08)', borderWidth: 1, borderColor: '#ff2d78', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  btnCambiarTexto: { color: '#ff2d78', fontFamily: 'monospace', fontSize: 12, letterSpacing: 2 },
});