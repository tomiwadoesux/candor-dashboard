/*
  Demo roster. Long on purpose — the point is to see how the people list
  behaves at real agency scale, not to look tidy at six names.
*/

export const ROSTER = [
  { id: "adaeze", name: "Adaeze Nwosu", city: "Lagos" },
  { id: "amara", name: "Amara Chukwu", city: "Lagos" },
  { id: "anais", name: "Anaïs Dubois", city: "Paris" },
  { id: "beatrice", name: "Beatrice Hall", city: "London" },
  { id: "bisi", name: "Bisi Adeyemi", city: "Lagos" },
  { id: "camille", name: "Camille Laurent", city: "Paris" },
  { id: "chidera", name: "Chidera Okafor", city: "Lagos" },
  { id: "clara", name: "Clara Whitfield", city: "London" },
  { id: "daniela", name: "Daniela Rossi", city: "Milan" },
  { id: "ebun", name: "Ebun Salami", city: "Lagos" },
  { id: "elena", name: "Elena Marchetti", city: "Milan" },
  { id: "folake", name: "Folake Adeniyi", city: "Lagos", team: "Managing Director" },
  { id: "farida", name: "Farida Bello", city: "Abuja" },
  { id: "freya", name: "Freya Lindqvist", city: "Stockholm" },
  { id: "grace", name: "Grace Mbeki", city: "London" },
  { id: "hana", name: "Hana Takahashi", city: "New York" },
  { id: "ifeoma", name: "Ifeoma Eze", city: "Lagos" },
  { id: "imani", name: "Imani Brooks", city: "New York" },
  { id: "isabel", name: "Isabel Ferreira", city: "Lisbon" },
  { id: "jade", name: "Jade Moreau", city: "Paris" },
  { id: "kemi", name: "Kemi Adebayo", city: "Lagos" },
  { id: "lara", name: "Lara Okonjo", city: "London" },
  { id: "lena", name: "Lena Vogel", city: "Berlin" },
  { id: "maja", name: "Maja Nowak", city: "Warsaw" },
  { id: "marta", name: "Marta Silva", city: "Lisbon" },
  { id: "nadia", name: "Nadia Okonkwo", city: "London", team: "Agent" },
  { id: "naomi", name: "Naomi Fitzgerald", city: "London" },
  { id: "nia", name: "Nia Campbell", city: "New York" },
  { id: "olamide", name: "Olamide Bakare", city: "Lagos" },
  { id: "priya", name: "Priya Raman", city: "New York" },
  { id: "rosa", name: "Rosa Delgado", city: "Madrid" },
  { id: "sade", name: "Sade Ogunlesi", city: "Lagos" },
  { id: "sasha", name: "Sasha Petrova", city: "Berlin" },
  { id: "simone", name: "Simone Laurent", city: "Paris" },
  { id: "sofia", name: "Sofia Almeida", city: "Lisbon" },
  { id: "tara", name: "Tara O'Brien", city: "London" },
  { id: "thandiwe", name: "Thandiwe Zulu", city: "Cape Town" },
  { id: "tunde", name: "Tunde Bakare", city: "London", team: "Manager" },
  { id: "yara", name: "Yara Haddad", city: "Beirut" },
  { id: "zara", name: "Zara Achebe", city: "London", you: true },
  { id: "zoe", name: "Zoë Bennett", city: "London" },
].sort((a, b) => a.name.localeCompare(b.name));

export const byId = Object.fromEntries(ROSTER.map((p) => [p.id, p]));

// The three people who represent you, pinned above everyone else.
export const TEAM_ORDER = ["Manager", "Agent", "Managing Director"];

export function initials(name) {
  const parts = name.split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

// Names stay black and white. Colour in this UI means state, never identity.
