const algeriaCities = require("./algeria_cities.json");

const wilayasData = {
  Adrar: algeriaCities
    .filter((city) => city.wilaya_code === "01")
    .map((city) => city.commune_name_ascii),
  Chlef: algeriaCities
    .filter((city) => city.wilaya_code === "02")
    .map((city) => city.commune_name_ascii),
  Laghouat: algeriaCities
    .filter((city) => city.wilaya_code === "03")
    .map((city) => city.commune_name_ascii),
  "Oum El Bouaghi": algeriaCities
    .filter((city) => city.wilaya_code === "04")
    .map((city) => city.commune_name_ascii),
  Batna: algeriaCities
    .filter((city) => city.wilaya_code === "05")
    .map((city) => city.commune_name_ascii),
  Béjaïa: algeriaCities
    .filter((city) => city.wilaya_code === "06")
    .map((city) => city.commune_name_ascii),
  Biskra: algeriaCities
    .filter((city) => city.wilaya_code === "07")
    .map((city) => city.commune_name_ascii),
  Béchar: algeriaCities
    .filter((city) => city.wilaya_code === "08")
    .map((city) => city.commune_name_ascii),
  Blida: algeriaCities
    .filter((city) => city.wilaya_code === "09")
    .map((city) => city.commune_name_ascii),
  Bouira: algeriaCities
    .filter((city) => city.wilaya_code === "10")
    .map((city) => city.commune_name_ascii),
  Tamanrasset: algeriaCities
    .filter((city) => city.wilaya_code === "11")
    .map((city) => city.commune_name_ascii),
  Tébessa: algeriaCities
    .filter((city) => city.wilaya_code === "12")
    .map((city) => city.commune_name_ascii),
  Tlemcen: algeriaCities
    .filter((city) => city.wilaya_code === "13")
    .map((city) => city.commune_name_ascii),
  Tiaret: algeriaCities
    .filter((city) => city.wilaya_code === "14")
    .map((city) => city.commune_name_ascii),
  "Tizi Ouzou": algeriaCities
    .filter((city) => city.wilaya_code === "15")
    .map((city) => city.commune_name_ascii),
  Algiers: algeriaCities
    .filter((city) => city.wilaya_code === "16")
    .map((city) => city.commune_name_ascii),
  Djelfa: algeriaCities
    .filter((city) => city.wilaya_code === "17")
    .map((city) => city.commune_name_ascii),
  Jijel: algeriaCities
    .filter((city) => city.wilaya_code === "18")
    .map((city) => city.commune_name_ascii),
  Sétif: algeriaCities
    .filter((city) => city.wilaya_code === "19")
    .map((city) => city.commune_name_ascii),
  Saïda: algeriaCities
    .filter((city) => city.wilaya_code === "20")
    .map((city) => city.commune_name_ascii),
  Skikda: algeriaCities
    .filter((city) => city.wilaya_code === "21")
    .map((city) => city.commune_name_ascii),
  "Sidi Bel Abbès": algeriaCities
    .filter((city) => city.wilaya_code === "22")
    .map((city) => city.commune_name_ascii),
  Annaba: algeriaCities
    .filter((city) => city.wilaya_code === "23")
    .map((city) => city.commune_name_ascii),
  Guelma: algeriaCities
    .filter((city) => city.wilaya_code === "24")
    .map((city) => city.commune_name_ascii),
  Constantine: algeriaCities
    .filter((city) => city.wilaya_code === "25")
    .map((city) => city.commune_name_ascii),
  Médéa: algeriaCities
    .filter((city) => city.wilaya_code === "26")
    .map((city) => city.commune_name_ascii),
  Mostaganem: algeriaCities
    .filter((city) => city.wilaya_code === "27")
    .map((city) => city.commune_name_ascii),
  "M'Sila": algeriaCities
    .filter((city) => city.wilaya_code === "28")
    .map((city) => city.commune_name_ascii),
  Mascara: algeriaCities
    .filter((city) => city.wilaya_code === "29")
    .map((city) => city.commune_name_ascii),
  Ouargla: algeriaCities
    .filter((city) => city.wilaya_code === "30")
    .map((city) => city.commune_name_ascii),
  Oran: algeriaCities
    .filter((city) => city.wilaya_code === "31")
    .map((city) => city.commune_name_ascii),
  "El Bayadh": algeriaCities
    .filter((city) => city.wilaya_code === "32")
    .map((city) => city.commune_name_ascii),
  Illizi: algeriaCities
    .filter((city) => city.wilaya_code === "33")
    .map((city) => city.commune_name_ascii),
  "Bordj Bou Arréridj": algeriaCities
    .filter((city) => city.wilaya_code === "34")
    .map((city) => city.commune_name_ascii),
  Boumerdès: algeriaCities
    .filter((city) => city.wilaya_code === "35")
    .map((city) => city.commune_name_ascii),
  "El Tarf": algeriaCities
    .filter((city) => city.wilaya_code === "36")
    .map((city) => city.commune_name_ascii),
  Tindouf: algeriaCities
    .filter((city) => city.wilaya_code === "37")
    .map((city) => city.commune_name_ascii),
  Tissemsilt: algeriaCities
    .filter((city) => city.wilaya_code === "38")
    .map((city) => city.commune_name_ascii),
  "El Oued": algeriaCities
    .filter((city) => city.wilaya_code === "39")
    .map((city) => city.commune_name_ascii),
  Khenchela: algeriaCities
    .filter((city) => city.wilaya_code === "40")
    .map((city) => city.commune_name_ascii),
  "Souk Ahras": algeriaCities
    .filter((city) => city.wilaya_code === "41")
    .map((city) => city.commune_name_ascii),
  Tipaza: algeriaCities
    .filter((city) => city.wilaya_code === "42")
    .map((city) => city.commune_name_ascii),
  Mila: algeriaCities
    .filter((city) => city.wilaya_code === "43")
    .map((city) => city.commune_name_ascii),
  "Aïn Defla": algeriaCities
    .filter((city) => city.wilaya_code === "44")
    .map((city) => city.commune_name_ascii),
  Naâma: algeriaCities
    .filter((city) => city.wilaya_code === "45")
    .map((city) => city.commune_name_ascii),
  "Aïn Témouchent": algeriaCities
    .filter((city) => city.wilaya_code === "46")
    .map((city) => city.commune_name_ascii),
  Ghardaïa: algeriaCities
    .filter((city) => city.wilaya_code === "47")
    .map((city) => city.commune_name_ascii),
  Relizane: algeriaCities
    .filter((city) => city.wilaya_code === "48")
    .map((city) => city.commune_name_ascii),
  Timimoun: algeriaCities
    .filter((city) => city.wilaya_code === "49")
    .map((city) => city.commune_name_ascii),
  "Bordj Badji Mokhtar": algeriaCities
    .filter((city) => city.wilaya_code === "50")
    .map((city) => city.commune_name_ascii),
  "Ouled Djellal": algeriaCities
    .filter((city) => city.wilaya_code === "51")
    .map((city) => city.commune_name_ascii),
  "Béni Abbès": algeriaCities
    .filter((city) => city.wilaya_code === "52")
    .map((city) => city.commune_name_ascii),
  "In Salah": algeriaCities
    .filter((city) => city.wilaya_code === "53")
    .map((city) => city.commune_name_ascii),
  "In Guezzam": algeriaCities
    .filter((city) => city.wilaya_code === "54")
    .map((city) => city.commune_name_ascii),
  Touggourt: algeriaCities
    .filter((city) => city.wilaya_code === "55")
    .map((city) => city.commune_name_ascii),
  Djanet: algeriaCities
    .filter((city) => city.wilaya_code === "56")
    .map((city) => city.commune_name_ascii),
  "El M'Ghair": algeriaCities
    .filter((city) => city.wilaya_code === "57")
    .map((city) => city.commune_name_ascii),
  "El Menia": algeriaCities
    .filter((city) => city.wilaya_code === "58")
    .map((city) => city.commune_name_ascii),
};

module.exports = wilayasData;
