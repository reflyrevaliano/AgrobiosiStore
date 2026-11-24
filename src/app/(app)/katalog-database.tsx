import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 20;
const CATEGORIES = ['Semua', 'Pupuk', 'Bibit Tanaman', 'Benih Tanaman', 'Pestisida', 'Peralatan Pertanian'];
type Product = { id: number; name: string; category: string; price: number; stock: number };
const rupiah = (value: number) => 'Rp' + value.toLocaleString('id-ID');

export default function DatabaseCatalog() {
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Semua');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState<number | null>(null);
  const [matches, setMatches] = useState<number | null>(null);
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  // Count all records on mount or explicit refresh; never download all records.
  useEffect(() => {
    let active = true;
    setTotal(null);
    async function countAll() {
      if (!supabase) return;
      try {
        const { count, error: err } = await supabase.from('demo_products').select('id', { count: 'exact', head: true });
        if (active && !err) setTotal(count);
      } catch { /* UI keeps count unavailable; page query reports its own errors. */ }
    }
    void countAll();
    return () => { active = false; };
  }, [revision]);

  // Database-side filtering and pagination. Ignore stale requests on rapid changes.
  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setRows([]); setMatches(null);
    async function load() {
      try {
        if (!supabase) throw new Error('Konfigurasi Supabase belum tersedia.');
        let query = supabase.from('demo_products').select('id,name,category,price,stock', { count: 'exact' });
        if (category !== 'Semua') query = query.eq('category', category);
        // Treat percent, underscore and backslash as literals in LIKE.
        const term = search.replace(/[\\%_]/g, '\\$&');
        if (term) query = query.ilike('name', `%${term}%`);
        const start = page * PAGE_SIZE;
        const { data, count, error: err } = await query.order('id', { ascending: true }).range(start, start + PAGE_SIZE - 1);
        if (err) throw new Error(err.message);
        if (active) { setRows((data ?? []) as Product[]); setMatches(count); }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Gagal mengambil produk.');
      } finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [search, category, page, revision]);

  function applySearch() { setPage(0); setSearch(draft.trim()); }
  function reset() { setDraft(''); setSearch(''); setCategory('Semua'); setPage(0); }
  const pages = matches === null ? null : Math.max(1, Math.ceil(matches / PAGE_SIZE));
  return <View style={s.container}>
    <View style={s.summary}>
      <Text style={s.title}>Katalog Database</Text>
      <Text style={s.total}>{total === null ? '—' : total.toLocaleString('id-ID')}</Text>
      <Text style={s.muted}>Total produk dummy di Supabase • {PAGE_SIZE} per halaman</Text>
    </View>
    <View style={s.searchRow}>
      <TextInput style={s.input} placeholder="Cari nama produk..." value={draft} onChangeText={setDraft} onSubmitEditing={applySearch} returnKeyType="search" maxLength={100} />
      <Pressable style={s.button} onPress={applySearch}><Text style={s.white}>Cari</Text></Pressable>
      <Pressable style={s.lightButton} onPress={reset}><Text style={s.green}>Reset</Text></Pressable>
    </View>
    <View style={s.chips}>{CATEGORIES.map(c => <Pressable key={c} onPress={() => {setCategory(c);setPage(0);}} style={[s.chip, category === c && s.activeChip]}><Text style={category === c ? s.white : s.green}>{c}</Text></Pressable>)}</View>
    <View style={s.meta}><Text style={s.muted}>{matches === null ? 'Hasil: —' : `Hasil: ${matches.toLocaleString('id-ID')} produk`}</Text><Pressable onPress={() => setRevision(v => v+1)}><Text style={s.green}>Muat ulang</Text></Pressable></View>
    {loading ? <View style={s.center}><ActivityIndicator color="#286341" size="large"/><Text>Memuat data...</Text></View> : error ? <View style={s.center}><Text style={s.error}>{error}</Text><Pressable style={s.button} onPress={() => setRevision(v=>v+1)}><Text style={s.white}>Coba lagi</Text></Pressable></View> : <FlatList style={{flex:1}} data={rows} keyExtractor={item=>String(item.id)} ListEmptyComponent={<Text style={s.empty}>Tidak ada produk yang cocok.</Text>} renderItem={({item})=><View style={s.product}><Text style={s.name}>{item.name}</Text><Text style={s.muted}>#{item.id} • {item.category} • Stok {item.stock}</Text><Text style={s.price}>{rupiah(item.price)}</Text></View>}/>}
    <View style={s.footer}>
      <Pressable disabled={loading || page===0} style={[s.button, (loading || page===0) && s.disabled]} onPress={()=>setPage(v=>Math.max(0,v-1))}><Text style={s.white}>Sebelumnya</Text></Pressable>
      <Text style={s.muted}>{page+1} / {pages===null?'—':pages.toLocaleString('id-ID')}</Text>
      <Pressable disabled={loading || pages===null || page+1>=pages} style={[s.button,(loading || pages===null || page+1>=pages)&&s.disabled]} onPress={()=>setPage(v=>v+1)}><Text style={s.white}>Berikutnya</Text></Pressable>
    </View>
  </View>;
}
const s=StyleSheet.create({container:{flex:1,padding:14,backgroundColor:'#f6f7ef'},summary:{backgroundColor:'#e1efdf',padding:15,borderRadius:12,marginBottom:12},title:{fontSize:16,fontWeight:'700',color:'#285a3e'},total:{fontSize:32,fontWeight:'800',color:'#234e35'},muted:{color:'#506355',fontSize:12},searchRow:{flexDirection:'row',gap:6,alignItems:'center'},input:{flex:1,minWidth:0,padding:10,borderWidth:1,borderColor:'#b9c9b7',backgroundColor:'#fff',borderRadius:8},button:{backgroundColor:'#286341',padding:10,borderRadius:8,alignItems:'center'},lightButton:{padding:10},white:{color:'#fff',fontWeight:'600',fontSize:12},green:{color:'#286341',fontWeight:'600',fontSize:12},chips:{flexDirection:'row',flexWrap:'wrap',gap:6,marginVertical:10},chip:{borderRadius:20,borderWidth:1,borderColor:'#91b69b',paddingHorizontal:10,paddingVertical:7},activeChip:{backgroundColor:'#286341'},meta:{flexDirection:'row',justifyContent:'space-between',marginBottom:8},center:{flex:1,alignItems:'center',justifyContent:'center',gap:12},error:{color:'#a32b2b',textAlign:'center'},empty:{padding:20,textAlign:'center'},product:{backgroundColor:'#fff',padding:12,marginBottom:8,borderRadius:9,borderWidth:1,borderColor:'#e2e9df'},name:{fontWeight:'700',fontSize:15,color:'#23392b',marginBottom:4},price:{fontWeight:'700',color:'#286341',marginTop:5},footer:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8,paddingTop:10},disabled:{opacity:0.4}});
