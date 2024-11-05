function useMyGlsCounties(country) {
  const counties = [
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

  if (country === "RO") {
    return counties;
  }

  return null;
}

export default useMyGlsCounties;
