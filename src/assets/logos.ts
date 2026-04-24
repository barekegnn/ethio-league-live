// Centralized registry of generated league + club crest assets.
// Imported as ES modules so Vite bundles them with hashed URLs.

import saintGeorge from "./clubs/saint-george.png";
import ethiopianCoffee from "./clubs/ethiopian-coffee.png";
import fasilKenema from "./clubs/fasil-kenema.png";
import bahirDarKenema from "./clubs/bahir-dar-kenema.png";
import hawassaKenema from "./clubs/hawassa-kenema.png";
import wolaittaDicha from "./clubs/wolaitta-dicha.png";
import sidamaBunna from "./clubs/sidama-bunna.png";
import adamaCity from "./clubs/adama-city.png";

import epl from "./leagues/epl.png";
import ewpl from "./leagues/ewpl.png";
import el2Men from "./leagues/el2-men.png";
import el2Women from "./leagues/el2-women.png";
import enlMen from "./leagues/enl-men.png";
import enlWomen from "./leagues/enl-women.png";
import eylMen from "./leagues/eyl-men.png";
import eylWomen from "./leagues/eyl-women.png";

export const CLUB_LOGOS: Record<string, string> = {
  "saint-george": saintGeorge,
  "ethiopian-coffee": ethiopianCoffee,
  "fasil-kenema": fasilKenema,
  "bahir-dar-kenema": bahirDarKenema,
  "hawassa-kenema": hawassaKenema,
  "wolaitta-dicha": wolaittaDicha,
  "sidama-bunna": sidamaBunna,
  "adama-city": adamaCity,
};

export const LEAGUE_LOGOS: Record<string, string> = {
  epl,
  ewpl,
  "el2-men": el2Men,
  "el2-women": el2Women,
  "enl-men": enlMen,
  "enl-women": enlWomen,
  "eyl-men": eylMen,
  "eyl-women": eylWomen,
};
