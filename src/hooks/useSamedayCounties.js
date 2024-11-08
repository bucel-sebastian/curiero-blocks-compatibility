function useSamedayCounties(country) {
  const romanian_counties = [
    ["AB", "Alba"],
    ["AR", "Arad"],
    ["AG", "Arges"],
    ["BC", "Bacau"],
    ["BH", "Bihor"],
    ["BN", "Bistrita-Nasaud"],
    ["BT", "Botosani"],
    ["BR", "Braila"],
    ["BV", "Brasov"],
    ["B", "Bucuresti"],
    ["BZ", "Buzau"],
    ["CL", "Calarasi"],
    ["CS", "Caras-Severin"],
    ["CJ", "Cluj"],
    ["CT", "Constanta"],
    ["CV", "Covasna"],
    ["DB", "Dambovita"],
    ["DJ", "Dolj"],
    ["GL", "Galati"],
    ["GJ", "Gorj"],
    ["GR", "Giurgiu"],
    ["HR", "Harghita"],
    ["HD", "Hunedoara"],
    ["IL", "Ialomita"],
    ["IS", "Iasi"],
    ["IF", "Ilfov"],
    ["MM", "Maramures"],
    ["MH", "Mehedinti"],
    ["MS", "Mures"],
    ["NT", "Neamt"],
    ["OT", "Olt"],
    ["PH", "Prahova"],
    ["SJ", "Salaj"],
    ["SM", "Satu Mare"],
    ["SB", "Sibiu"],
    ["SV", "Suceava"],
    ["TR", "Teleorman"],
    ["TM", "Timis"],
    ["TL", "Tulcea"],
    ["VS", "Vaslui"],
    ["VL", "Valcea"],
    ["VN", "Vrancea"],
  ];
  const hungarian_counties = [
    ["BK", "Bács-Kiskun"],
    ["BE", "Békés"],
    ["BA", "Baranya"],
    ["BZ", "Borsod-Abaúj-Zemplén"],
    ["BU", "Budapesta"],
    ["CS", "Csongrád-Csanád"],
    ["FE", "Fejér"],
    ["GS", "Győr-Moson-Sopron"],
    ["HB", "Hajdú-Bihar"],
    ["HE", "Heves"],
    ["JN", "Jász-Nagykun-Szolnok"],
    ["KE", "Komárom-Esztergom"],
    ["NO", "Nógrád"],
    ["PE", "Pest"],
    ["SO", "Somogy"],
    ["SZ", "Szabolcs-Szatmár-Bereg"],
    ["TO", "Tolna"],
    ["VA", "Vas"],
    ["VE", "Veszprém"],
    ["ZA", "Zala"],
  ];
  const bulgarian_counties = [
    ["BG-01", "Благоевград"],
    ["BG-02", "Бургас"],
    ["BG-08", "Добрич"],
    ["BG-07", "Габрово"],
    ["BG-26", "Хасково"],
    ["BG-09", "Кърджали"],
    ["BG-10", "Кюстендил"],
    ["BG-11", "Ловеч"],
    ["BG-12", "Монтана"],
    ["BG-13", "Пазарджик"],
    ["BG-14", "Перник"],
    ["BG-15", "Плевен"],
    ["BG-16", "Пловдив"],
    ["BG-17", "Разград"],
    ["BG-18", "Русе"],
    ["BG-27", "Шумен"],
    ["BG-19", "Силистра"],
    ["BG-20", "Сливен"],
    ["BG-21", "Смолян"],
    ["BG-23", "София област"],
    ["BG-22", "София"],
    ["BG-24", "Стара Загора"],
    ["BG-25", "Търговище"],
    ["BG-03", "Варна"],
    ["BG-04", "Велико Търново"],
    ["BG-05", "Видин"],
    ["BG-06", "Враца"],
    ["BG-28", "Ямбол"],
  ];

  switch (country) {
    case "RO":
      return romanian_counties;
    case "HU":
      return hungarian_counties;
    case "BG":
      return bulgarian_counties;
    default:
      return romanian_counties;
  }
}

export default useSamedayCounties;
