// ══════════════════════════════════════════════════════════════
// Almanca Duo — Supabase bağlantı katmanı (HENÜZ AKTİF DEĞİL)
//
// Bu dosya index.html'e BİLEREK bağlanmadı. Sebep: gerçek bir Supabase
// projesi olmadan bu kodu test etmenin imkanı yok, ve test edilmemiş ağ
// kodunu canlı uygulamaya eklemek riskli. URL+anon key geldiğinde:
//   1) Aşağıdaki SUPABASE_URL ve SUPABASE_ANON_KEY değerlerini doldur
//   2) index.html'in <head> kısmına şu iki satırı ekle:
//        <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
//        <script src="icerik/supabase/client.js"></script>
//   3) Bu dosyadaki fonksiyonları index.html'den çağırmaya başla.
// ══════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://tculmzddalcrxhzxjdnk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_OwJiglI0Kdj9I9Q2NF2JIA_48bZXlZx';

let sb = null;
function sbHazirMi() {
  if (sb) return true;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
  if (typeof window.supabase === 'undefined') return false;   // CDN script'i yüklenmemiş
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return true;
}

// ── Kimlik ──────────────────────────────────────────────
async function sbGirisYap(email, parola) {
  if (!sbHazirMi()) return { hata: 'Supabase henüz bağlı değil.' };
  return sb.auth.signInWithPassword({ email, password: parola });
}
async function sbKayitOl(email, parola, adSoyad) {
  if (!sbHazirMi()) return { hata: 'Supabase henüz bağlı değil.' };
  const { data, error } = await sb.auth.signUp({ email, password: parola, options: { data: { display_name: adSoyad } } });
  if (error) return { error };
  if (data.session) await sbProfilGaranti(data.user, adSoyad);
  return { data };
}

// Profil satiri yoksa olusturur (e-posta dogrulamali kayitta ilk giriste calisir)
async function sbProfilGaranti(user, adSoyad) {
  if (!sbHazirMi() || !user) return adSoyad || (user && user.email) || '';
  const { data } = await sb.from('profiles').select('display_name').eq('id', user.id).maybeSingle();
  if (data && data.display_name) return data.display_name;
  const isim = adSoyad || (user.user_metadata && user.user_metadata.display_name) || (user.email || 'Kullanici').split('@')[0];
  await sb.from('profiles').insert({ id: user.id, display_name: isim });
  return isim;
}

// ── İlerleme ────────────────────────────────────────────
async function sbIlerlemeKaydet(topicId, dogru, yanlis, tamamlandi) {
  if (!sbHazirMi()) return;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;
  return sb.from('user_topic_progress').upsert({
    user_id: user.id, topic_id: topicId, dogru, yanlis,
    tamamlandi, son_calisma: new Date().toISOString(),
  });
}

// ── Arkadaşın ilerlemesi (Düello ekranı için) ───────────
async function sbArkadasIlerlemesi() {
  if (!sbHazirMi()) return [];
  const { data } = await sb.from('user_topic_progress').select('*');
  return data || [];
}

// ── Çevrimiçi durumu (Realtime Presence) ────────────────
let sbPresenceChannel = null;
let sbPresenceTaban = {};
function sbCevrimiciBaslat(userId, extraData) {
  if (!sbHazirMi()) return;
  if (sbPresenceChannel) return;
  sbPresenceChannel = sb.channel('almanca-duo-online');
  sbPresenceChannel
    .on('presence', { event: 'sync' }, () => {
      const durum = sbPresenceChannel.presenceState();
      window.dispatchEvent(new CustomEvent('almanca-online-degisti', { detail: durum }));
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        sbPresenceTaban = Object.assign({ user_id: userId }, extraData || {});
        sbPresenceChannel.track(Object.assign({ online_at: new Date().toISOString() }, sbPresenceTaban));
      }
    });
}

function sbPresenceMarka(extraData) {
  if (!sbPresenceChannel) return;
  sbPresenceTaban = Object.assign(sbPresenceTaban, extraData || {});
  sbPresenceChannel.track(Object.assign({ online_at: new Date().toISOString() }, sbPresenceTaban));
}

// ── Ortak çalışma oturumu ────────────────────────────────
async function sbOturumaKatil(sessionId, hangiTaraf) {
  if (!sbHazirMi()) return;
  const alan = hangiTaraf === 'a' ? 'katilan_a' : 'katilan_b';
  return sb.from('study_sessions').update({ [alan]: true }).eq('id', sessionId);
}
