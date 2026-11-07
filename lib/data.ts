import { TimeCapsule, StepPhase } from "./types";

export const INITIAL_CAPSULES: TimeCapsule[] = [
  {
    id: "capsule-2040",
    year: 2040,
    targetDate: "14 Oct 2040",
    title: "The Architects' Pact of 2040",
    category: "ARCHITECTURAL MANIFESTO",
    custodian: "Studio Val d'Hérens — Valais",
    description: "Unsealed blueprints and structural tenets for high-altitude timber sanctuaries built without mechanical fasteners or synthetic resin.",
    shaKey: "SHA512:9e84d72a81f3b0e1c2d9a6f874bc029e81b37812f2040",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    targetTimestamp: new Date("2040-10-14T00:00:00Z").getTime(),
  },
  {
    id: "capsule-2036",
    year: 2036,
    targetDate: "03 June 2036",
    title: "Letters to the Mediterranean Shoreline",
    category: "ECOLOGICAL WITNESS",
    custodian: "Dr. Elena Vane — Bonifacio",
    description: "Systematic photographic surveys and hydro-acoustic recordings of coastal limestone shelves before the decadal sea tides reconfigured the archipelago.",
    shaKey: "SHA512:c310fb4e97a296d19488bc91aa3021f7c5e2036",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    targetTimestamp: new Date("2036-06-03T00:00:00Z").getTime(),
  },
  {
    id: "capsule-2031",
    year: 2031,
    targetDate: "28 Nov 2031",
    title: "The Last Analog Symphony",
    category: "ACOUSTIC ARCHIVE",
    custodian: "K. Lindqvist — Norrbotten",
    description: "Direct-to-lacquer unmastered magnetic reel tapes recorded in a decommissioned blast furnace, sealed with beeswax and zero digital degradation.",
    shaKey: "SHA512:178b02da4f938217bbad749e003189a01f72031",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    targetTimestamp: new Date("2031-11-28T00:00:00Z").getTime(),
  },
  {
    id: "capsule-2045",
    year: 2045,
    targetDate: "08 Dec 2045",
    title: "First Harvest of the Arctic Vault",
    category: "BIOLOGICAL HERITAGE",
    custodian: "Svalbard Gene Trust — Longyearbyen",
    description: "Genomic maps and micro-cryopreserved heirloom emmer wheat germplasm destined for post-drought alpine terracing.",
    shaKey: "SHA512:44dfa8b11c900384812a6f2045b81099238e2045",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    targetTimestamp: new Date("2045-12-08T00:00:00Z").getTime(),
  },
  {
    id: "capsule-2051",
    year: 2051,
    targetDate: "19 Sept 2051",
    title: "Consensus on Synthetic Sentience",
    category: "PHILOSOPHICAL PROTOCOL",
    custodian: "Geneva Juridical Circle",
    description: "The original signed vellum protocol declaring synthetic sentience exempt from commercial ownership and proprietary obsolescence.",
    shaKey: "SHA512:f8721c0b39678e00184b2e679c2051ad39812051",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    targetTimestamp: new Date("2051-09-19T00:00:00Z").getTime(),
  },
];

export const THREE_STEPS: StepPhase[] = [
  {
    number: "01",
    eyebrow: "PHASE 01 // INSCRIPTION",
    title: "Inscribe with archival intent.",
    subtitle: "Write for who you will become.",
    description:
      "Draft your testament, intimate confession, or long-range hypothesis into our distraction-free, markdown-enabled typographic console. No ephemeral noise. Just thought preserved in high-density text.",
    technicalTag: "ENCRYPTION: AES-256-GCM / LOCAL ISOLATION",
    iconName: "PenTool",
  },
  {
    number: "02",
    eyebrow: "PHASE 02 // CRYPTOGRAPHIC SEAL",
    title: "Cast into the temporal vault.",
    subtitle: "Mathematical immutability until designated time.",
    description:
      "Designate the awakening date—from 3 to 75 years hence. Your capsule is encrypted with a distributed verifiable delay function. Neither administrators, algorithms, nor quantum coercion can pierce the lock before the clock strikes.",
    technicalTag: "TIME-LOCK: VERIFIABLE DELAY FUNCTION (VDF)",
    iconName: "Lock",
  },
  {
    number: "03",
    eyebrow: "PHASE 03 // THE AWAKENING",
    title: "Awaken when the era arrives.",
    subtitle: "A mirror held across the decades.",
    description:
      "When the designated solstice or birthday arrives, the cryptographic cipher unravels automatically. An immutable dispatch is delivered to your designated heir, archive, or future self—preserved in its original purity.",
    technicalTag: "DISPATCH: SHA-512 TEMPORAL RELAY / IMMUTABLE DEPOSIT",
    iconName: "KeyRound",
  },
];

export const AVAILABLE_YEARS = [2028, 2031, 2036, 2040, 2045, 2055, 2065, 2080];

