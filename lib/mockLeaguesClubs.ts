/**
 * Static mock leagues and clubs used only by the fan sign-up preference picker.
 * These mirror the real data shape but are hardcoded so the picker works
 * even before the API responds.
 */

export const MOCK_LEAGUES = [
  { id: "epl-mock", name: "Ethiopian Premier League", shortName: "EPL", logo: "/leagues/epl.png", gender: "Men" },
  { id: "ewpl-mock", name: "Ethiopian Women's Premier League", shortName: "EWPL", logo: "/leagues/ewpl.png", gender: "Women" },
  { id: "el2-men-mock", name: "Ethiopian League Division 2 (Men)", shortName: "EL2", logo: "/leagues/el2-men.png", gender: "Men" },
  { id: "el2-women-mock", name: "Ethiopian League Division 2 (Women)", shortName: "EL2W", logo: "/leagues/el2-women.png", gender: "Women" },
  { id: "enl-men-mock", name: "Ethiopian National League (Men)", shortName: "ENL", logo: "/leagues/enl-men.png", gender: "Men" },
  { id: "enl-women-mock", name: "Ethiopian National League (Women)", shortName: "ENLW", logo: "/leagues/enl-women.png", gender: "Women" },
  { id: "eyl-men-mock", name: "Ethiopian Youth League (Men)", shortName: "EYL", logo: "/leagues/eyl-men.png", gender: "Youth" },
  { id: "eyl-women-mock", name: "Ethiopian Youth League (Women)", shortName: "EYLW", logo: "/leagues/eyl-women.png", gender: "Youth" },
];

export const MOCK_CLUBS = [
  { id: "saint-george-mock", name: "Saint George", shortName: "STG", logo: "/clubs/saint-george.png", city: "Addis Ababa" },
  { id: "ethiopian-coffee-mock", name: "Ethiopian Coffee", shortName: "ECF", logo: "/clubs/ethiopian-coffee.png", city: "Addis Ababa" },
  { id: "fasil-kenema-mock", name: "Fasil Kenema", shortName: "FAS", logo: "/clubs/fasil-kenema.png", city: "Gondar" },
  { id: "bahir-dar-kenema-mock", name: "Bahir Dar Kenema", shortName: "BDK", logo: "/clubs/bahir-dar-kenema.png", city: "Bahir Dar" },
  { id: "hawassa-kenema-mock", name: "Hawassa Kenema", shortName: "HWK", logo: "/clubs/hawassa-kenema.png", city: "Hawassa" },
  { id: "wolaitta-dicha-mock", name: "Wolaitta Dicha", shortName: "WDC", logo: "/clubs/wolaitta-dicha.png", city: "Wolaitta Sodo" },
  { id: "sidama-bunna-mock", name: "Sidama Bunna", shortName: "SDB", logo: "/clubs/sidama-bunna.png", city: "Hawassa" },
  { id: "adama-city-mock", name: "Adama City", shortName: "ADC", logo: "/clubs/adama-city.png", city: "Adama" },
];
