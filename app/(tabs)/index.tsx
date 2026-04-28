import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PERSONAJES = [
  { id: 'broker',     emoji: '💰', nombre: 'BROKER',     rol: 'Maestro de Finanzas', color: '#00d4ff',
    misiones: ['Registrar todos los gastos', 'No gastar en cosas innecesarias', 'Revisar tu balance', 'Apartar dinero para ahorro'] },
  { id: 'spartan',    emoji: '⚔️', nombre: 'SPARTAN',    rol: 'Guerrero del Gym',    color: '#ff2d78',
    misiones: ['Entrenar 45 minutos', 'Tomar 2L de agua', 'Comer limpio todo el día', 'Dormir 8 horas'] },
  { id: 'brain',      emoji: '🧠', nombre: 'BRAIN',      rol: 'Máquina Académica',   color: '#b44eff',
    misiones: ['Estudiar 2 horas', 'Completar todas las tareas', 'Repasar apuntes', 'No faltar a clases'] },
  { id: 'monje',      emoji: '🧘', nombre: 'MONJE',      rol: 'Maestro de Hábitos',  color: '#39ff14',
    misiones: ['Meditar 10 minutos', 'Leer 20 minutos', 'Sin redes antes de las 9am', 'Dormir antes de las 11pm'] },
  { id: 'freelancer', emoji: '⚡', nombre: 'FREELANCER', rol: 'Lobo Solitario',      color: '#ffb300',
    misiones: ['Completar lista de tareas', '1 hora de deep work', 'Responder mensajes', 'Aprender algo nuevo'] },
  { id: 'noctambulo', emoji: '🌙', nombre: 'NOCTÁMBULO', rol: 'Hijo de la Noche',   color: '#7c4dff',
    misiones: ['Sesión creativa nocturna', 'Planear el día siguiente', 'Hidratarte cada 2 horas', 'Dormir antes de las 3am'] },
];

export default function HomeScreen() {
  const [seleccionado, setSeleccionado] = useState(null);
  const [personajeGuardado, setPersonajeGuardado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    verificarPersonaje();
  }, []);

  async function verificarPersonaje() {
    try {
      const guardado = await AsyncStorage.getItem('personaje');
      if (guardado) {
        setPersonajeGuardado(JSON.parse(guardado));
        router.replace('/(tabs)/explore');
      }
    } catch (e) {
      console.log('Error:', e);
    } finally {
      setCargando(false);
    }
  }

  async function iniciarMision() {
    if (!seleccionado) return;
    const personaje = PERSONAJES.find(p => p.id === seleccionado);
    try {
      await AsyncStorage.setItem('personaje', JSON.stringify(personaje));
    } catch (e) {
      console.log('Error:', e);
    }
    router.replace('/(tabs)/explore');
  }

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <Text style={styles.cargandoTexto}>// CARGANDO...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.fondo}>
      <Text style={styles.logo}>HABITQUEST</Text>
      <Text style={styles.sub}>// ELIGE TU CLASE //</Text>

      <View style={styles.grid}>
        {PERSONAJES.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[
              styles.carta,
              { borderColor: seleccionado === p.id ? p.color : '#1a1a35' },
              seleccionado === p.id && { shadowColor: p.color, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 }
            ]}
            onPress={() => setSeleccionado(p.id)}
          >
            <Text style={styles.emoji}>{p.emoji}</Text>
            <Text style={[styles.nombre, { color: p.color }]}>{p.nombre}</Text>
            <Text style={styles.rol}>{p.rol}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {seleccionado && (
        <View style={styles.preview}>
          {(() => {
            const p = PERSONAJES.find(x => x.id === seleccionado);
            return (
              <>
                <Text style={[styles.previewTitulo, { color: p.color }]}>
                  {p.emoji} {p.nombre}
                </Text>
                <Text style={styles.previewSub}>// MISIONES INICIALES</Text>
                {p.misiones.map((m, i) => (
                  <View key={i} style={styles.previewMision}>
                    <Text style={styles.previewPunto}>▸</Text>
                    <Text style={styles.previewTexto}>{m}</Text>
                  </View>
                ))}
              </>
            );
          })()}
        </View>
      )}

      {seleccionado && (
        <TouchableOpacity style={styles.boton} onPress={iniciarMision}>
          <Text style={styles.botonTexto}>▶ INICIAR MISIÓN</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: '#04040d', padding: 16 },
  cargando: { flex: 1, backgroundColor: '#04040d', alignItems: 'center', justifyContent: 'center' },
  cargandoTexto: { color: '#00d4ff', fontFamily: 'monospace', letterSpacing: 3 },
  logo: { fontSize: 24, fontWeight: 'bold', color: '#00d4ff', textAlign: 'center', letterSpacing: 4, marginTop: 60, marginBottom: 4 },
  sub: { fontSize: 11, color: '#5a5080', textAlign: 'center', letterSpacing: 3, marginBottom: 30, fontFamily: 'monospace' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 16 },
  carta: { width: '47%', backgroundColor: '#0d0d22', borderWidth: 1, borderRadius: 10, padding: 14, alignItems: 'center' },
  emoji: { fontSize: 32, marginBottom: 8 },
  nombre: { fontSize: 13, fontWeight: 'bold', letterSpacing: 2, marginBottom: 4 },
  rol: { fontSize: 10, color: '#5a5080', textAlign: 'center', letterSpacing: 1, fontFamily: 'monospace' },

  preview: { backgroundColor: '#0d0d22', borderWidth: 1, borderColor: '#1a1a35', borderRadius: 10, padding: 14, marginBottom: 14 },
  previewTitulo: { fontSize: 14, fontWeight: 'bold', letterSpacing: 2, marginBottom: 10, fontFamily: 'monospace' },
  previewSub: { fontSize: 9, color: '#5a5080', letterSpacing: 2, marginBottom: 8, fontFamily: 'monospace' },
  previewMision: { flexDirection: 'row', gap: 8, marginBottom: 6, alignItems: 'center' },
  previewPunto: { color: '#00d4ff', fontSize: 12 },
  previewTexto: { color: '#e0d8f0', fontSize: 12, flex: 1 },

  boton: { backgroundColor: 'rgba(0,212,255,0.1)', borderWidth: 1, borderColor: '#00d4ff', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 10 },
  botonTexto: { color: '#00d4ff', fontSize: 12, fontWeight: 'bold', letterSpacing: 3, fontFamily: 'monospace' },
});