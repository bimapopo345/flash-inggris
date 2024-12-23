// populatePhonetics.js

const { createClient } = require('@supabase/supabase-js');
const { Configuration, OpenAIApi } = require('openai');

/**
 * Konfigurasi Supabase
 * Pastikan Anda mengganti nilai SUPABASE_URL dan SUPABASE_KEY dengan milik Anda.
 */
const SUPABASE_URL = 'https://iqezjknfgtdercuveize.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxZXpqa25mZ3RkZXJjdXZlaXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NTE5NzQsImV4cCI6MjA1MDUyNzk3NH0.AYyZHPglGfInbOdf_ih3a745UQmwVena5TrbmfYBAKo'; // Ganti dengan Supabase Anon Key Anda
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Konfigurasi OpenAI (GLHF)
 * Pastikan Anda mengganti nilai GLHF_API_KEY dan GLHF_MODEL dengan milik Anda.
 */
const GLHF_API_KEY = 'glhf_ef882617166556f06dc68caa8cd36b75'; // Ganti dengan GLHF API Key Anda
const GLHF_MODEL = 'hf:meta-llama/Meta-Llama-3.1-405B-Instruct'; // Sesuaikan dengan model yang Anda gunakan

const configuration = new Configuration({
  apiKey: GLHF_API_KEY,
  basePath: 'https://glhf.chat/api/openai/v1', // Sesuaikan dengan basePath yang digunakan di WordList.js
});
const openai = new OpenAIApi(configuration);

/**
 * Data Phonemes
 */
const consonants = [
  { phoneme: 1, ipasymbol: "b", graphemes: "b, bb", examples: "bug, bubble", voiced: "Yes" },
  { phoneme: 2, ipasymbol: "d", graphemes: "d, dd, ed", examples: "dad, add, milled", voiced: "Yes" },
  { phoneme: 3, ipasymbol: "f", graphemes: "f, ff, ph, gh, lf, ft", examples: "fat, cliff, phone, enough, half, often", voiced: "No" },
  { phoneme: 4, ipasymbol: "g", graphemes: "g, gg, gh, gu, gue", examples: "gun, egg, ghost, guest, prologue", voiced: "Yes" },
  { phoneme: 5, ipasymbol: "h", graphemes: "h, wh", examples: "hop, who", voiced: "No" },
  { phoneme: 6, ipasymbol: "dʒ", graphemes: "j, ge, g, dge, di, gg", examples: "jam, wage, giraffe, edge, soldier, exaggerate", voiced: "Yes" },
  { phoneme: 7, ipasymbol: "k", graphemes: "k, c, ch, cc, lk, qu, q(u), ck, x", examples: "kit, cat, chris, accent, folk, bouquet, queen, rack, box", voiced: "No" },
  { phoneme: 8, ipasymbol: "l", graphemes: "l, ll", examples: "live, well", voiced: "Yes" },
  { phoneme: 9, ipasymbol: "m", graphemes: "m, mm, mb, mn, lm", examples: "man, summer, comb, column, palm", voiced: "Yes" },
  { phoneme: 10, ipasymbol: "n", graphemes: "n, nn, kn, gn, pn, mn", examples: "net, funny, know, gnat, pneumonic, mnemonic", voiced: "Yes" },
  { phoneme: 11, ipasymbol: "p", graphemes: "p, pp", examples: "pin, dippy", voiced: "No" },
  { phoneme: 12, ipasymbol: "r", graphemes: "r, rr, wr, rh", examples: "run, carrot, wrench, rhyme", voiced: "Yes" },
  { phoneme: 13, ipasymbol: "s", graphemes: "s, ss, c, sc, ps, st, ce, se", examples: "sit, less, circle, scene, psycho, listen, pace, course", voiced: "No" },
  { phoneme: 14, ipasymbol: "t", graphemes: "t, tt, th, ed", examples: "tip, matter, thomas, ripped", voiced: "No" },
  { phoneme: 15, ipasymbol: "v", graphemes: "v, f, ph, ve", examples: "vine, of, stephen, five", voiced: "Yes" },
  { phoneme: 16, ipasymbol: "w", graphemes: "w, wh, u, o", examples: "wit, why, quick, choir", voiced: "Yes" },
  { phoneme: 17, ipasymbol: "z", graphemes: "z, zz, s, ss, x, ze, se", examples: "zed, buzz, his, scissors, xylophone, craze", voiced: "Yes" },
  { phoneme: 18, ipasymbol: "ʒ", graphemes: "s, si, z", examples: "treasure, division, azure", voiced: "Yes" },
  { phoneme: 19, ipasymbol: "tʃ", graphemes: "ch, tch, tu, te", examples: "chip, watch, future, righteous", voiced: "No" },
  { phoneme: 20, ipasymbol: "ʃ", graphemes: "sh, ce, s, ci, si, ch, sci, ti", examples: "sham, ocean, sure, special, pension, machine, conscience, station", voiced: "No" },
  { phoneme: 21, ipasymbol: "θ", graphemes: "th", examples: "thongs", voiced: "No" },
  { phoneme: 22, ipasymbol: "ð", graphemes: "th", examples: "leather", voiced: "Yes" },
  { phoneme: 23, ipasymbol: "ŋ", graphemes: "ng, n, ngue", examples: "ring, pink, tongue", voiced: "Yes" },
  { phoneme: 24, ipasymbol: "j", graphemes: "y, i, j", examples: "you, onion, hallelujah", voiced: "Yes" },
];

const vowels = [
  { phoneme: 25, ipasymbol: "æ", graphemes: "a, ai, au", examples: "cat, plaid, laugh" },
  { phoneme: 26, ipasymbol: "eɪ", graphemes: "a, ai, eigh, aigh, ay, er, et, ei, au, a_e, ea, ey", examples: "bay, maid, weigh, straight, pay, foyer, filet, eight, gauge, mate, break, they" },
  { phoneme: 27, ipasymbol: "ɛ", graphemes: "e, ea, u, ie, ai, a, eo, ei, ae", examples: "end, bread, bury, friend, said, many, leopard, heifer, aesthetic" },
  { phoneme: 28, ipasymbol: "i:", graphemes: "e, ee, ea, y, ey, oe, ie, i, ei, eo, ay", examples: "be, bee, meat, lady, key, phoenix, grief, ski, deceive, people, quay" },
  { phoneme: 29, ipasymbol: "ɪ", graphemes: "i, e, o, u, ui, y, ie", examples: "it, england, women, busy, guild, gym, sieve" },
  { phoneme: 30, ipasymbol: "aɪ", graphemes: "i, y, igh, ie, uy, ye, ai, is, eigh, i_e", examples: "spider, sky, night, pie, guy, stye, aisle, island, height, kite" },
  { phoneme: 31, ipasymbol: "ɒ", graphemes: "a, ho, au, aw, ough", examples: "swan, honest, maul, slaw, fought" },
  { phoneme: 32, ipasymbol: "oʊ", graphemes: "o, oa, o_e, oe, ow, ough, eau, oo, ew", examples: "open, moat, bone, toe, sow, dough, beau, brooch, sew" },
  { phoneme: 33, ipasymbol: "ʊ", graphemes: "o, oo, u, ou", examples: "wolf, look, bush, would" },
  { phoneme: 34, ipasymbol: "ʌ", graphemes: "u, o, oo, ou", examples: "lug, monkey, blood, double" },
  { phoneme: 35, ipasymbol: "u:", graphemes: "o, oo, ew, ue, u_e, oe, ough, ui, oew, ou", examples: "who, loon, dew, blue, flute, shoe, through, fruit, manoeuvre, group" },
  { phoneme: 36, ipasymbol: "ɔɪ", graphemes: "oi, oy, uoy", examples: "join, boy, buoy" },
  { phoneme: 37, ipasymbol: "aʊ", graphemes: "ow, ou, ough", examples: "now, shout, bough" },
  { phoneme: 38, ipasymbol: "ə", graphemes: "a, er, i, ar, our, ur", examples: "about, ladder, pencil, dollar, honour, augur" },
  { phoneme: 39, ipasymbol: "eəʳ", graphemes: "air, are, ear, ere, eir, ayer", examples: "chair, dare, pear, where, their, prayer" },
  { phoneme: 40, ipasymbol: "ɑ:", graphemes: "a", examples: "arm" },
  { phoneme: 41, ipasymbol: "ɜ:ʳ", graphemes: "ir, er, ur, ear, or, our, yr", examples: "bird, term, burn, pearl, word, journey, myrtle" },
  { phoneme: 42, ipasymbol: "ɔ:", graphemes: "aw, a, or, oor, ore, oar, our, augh, ar, ough, au", examples: "paw, ball, fork, poor, fore, board, four, taught, war, bought, sauce" },
  { phoneme: 43, ipasymbol: "ɪəʳ", graphemes: "ear, eer, ere, ier", examples: "ear, steer, here, tier" },
  { phoneme: 44, ipasymbol: "ʊəʳ", graphemes: "ure, our", examples: "cure, tourist" },
];

/**
 * Fungsi untuk mengenerate 'indoapprox' menggunakan GLHF (AI API)
 * @param {string} ipasymbol - Simbol IPA
 * @returns {Promise<string>} - Perkiraan cara baca dalam bahasa Indonesia
 */
async function generateIndoApprox(ipasymbol) {
  const prompt = `
    You are a helpful linguistics assistant.
    Provide the Indonesian approximation of the following IPA symbol: "${ipasymbol}"

    Respond ONLY with the Indonesian pronunciation approximation as a short phrase.
    Do not include any extra text or explanations.
  `;

  try {
    const response = await openai.createChatCompletion({
      model: GLHF_MODEL,
      messages: [
        { role: "system", content: "You are a helpful linguistics assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3, // Rendah untuk konsistensi
    });

    let indoapprox = response.data.choices[0].message.content.trim();

    // Validasi sederhana
    if (!indoapprox) {
      indoapprox = "-";
    }

    return indoapprox;
  } catch (error) {
    console.error(`Error generating indoapprox for IPA ${ipasymbol}:`, error.message);
    return "-";
  }
}

/**
 * Fungsi untuk mengupdate 'indoapprox' di Supabase
 * @param {number} phoneme - Nomor phoneme
 * @param {string} indoapprox - Perkiraan cara baca dalam bahasa Indonesia
 */
async function updateIndoapproxInDB(phoneme, indoapprox) {
  const { error } = await supabase
    .from("phonetics")
    .update({ indoapprox }) // Pastikan nama kolom sesuai dengan tabel
    .eq("phoneme", phoneme);

  if (error) {
    console.error(`Error updating phoneme ${phoneme}:`, error.message);
  } else {
    console.log(`Updated phoneme ${phoneme} with indoapprox: ${indoapprox}`);
  }
}

/**
 * Fungsi utama untuk mengisi tabel phonetics dengan data phonemes
 * dan mengenerate 'indoapprox' menggunakan GLHF
 */
async function populatePhonetics() {
  try {
    // 1. Insert data consonants dan vowels ke tabel phonetics
    const allPhonemes = consonants.concat(vowels);

    // Cek apakah phonemes sudah ada di tabel untuk menghindari duplikasi
    const { data: existingPhonemes, error: fetchError } = await supabase
      .from("phonetics")
      .select("phoneme");

    if (fetchError) {
      console.error("Error fetching existing phonemes:", fetchError.message);
      return;
    }

    const existingPhonemeNumbers = existingPhonemes.map((p) => p.phoneme);
    const newPhonemes = allPhonemes.filter((p) => !existingPhonemeNumbers.includes(p.phoneme));

    if (newPhonemes.length > 0) {
      const { error: insertError } = await supabase.from("phonetics").insert(
        newPhonemes.map((p) => ({
          phoneme: p.phoneme,
          ipasymbol: p.ipasymbol,
          graphemes: p.graphemes,
          examples: p.examples,
          voiced: p.voiced || null,
          indoapprox: "-", // Placeholder
        }))
      );

      if (insertError) {
        console.error("Error inserting phonemes:", insertError.message);
        return;
      }

      console.log(`Inserted ${newPhonemes.length} phonemes into phonetics table.`);
    } else {
      console.log("All phonemes already exist in phonetics table.");
    }

    // 2. Fetch phonemes yang belum memiliki 'indoapprox'
    const { data: phonetics, error: fetchPhoneticsError } = await supabase
      .from("phonetics")
      .select("*")
      .or("indoapprox.eq.-,indoapprox.is.null");

    if (fetchPhoneticsError) {
      console.error("Error fetching phonetics for indoapprox generation:", fetchPhoneticsError.message);
      return;
    }

    if (phonetics.length === 0) {
      console.log("All phonemes already have indoapprox.");
      return;
    }

    // 3. Generate 'indoapprox' untuk phonemes yang belum diisi
    for (const phoneme of phonetics) {
      console.log(`Generating indoapprox for phoneme ${phoneme.phoneme} (${phoneme.ipasymbol})...`);
      const indoapprox = await generateIndoApprox(phoneme.ipasymbol);
      await updateIndoapproxInDB(phoneme.phoneme, indoapprox);

      // Delay untuk menghindari rate limit
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 detik
    }

    console.log("Completed populating phonetics with indoapprox.");
  } catch (error) {
    console.error("Error in populatePhonetics:", error.message);
  }
}

// Jalankan fungsi utama
populatePhonetics();