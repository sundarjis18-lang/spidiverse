export interface QuestBadgeInfo {
  id: number;
  title: string;
  image: string;
  difficulty: string;
  points: number;
  description: string;
}

export const QUEST_BADGES: Record<number, QuestBadgeInfo> = {
  1: {
    id: 1,
    title: 'THE BROKEN CALCULATOR',
    image: '/badges/badge_01.png',
    difficulty: 'Beginner',
    points: 100,
    description: 'Oscorp Web-Sensors syntax diagnostics repaired.'
  },
  2: {
    id: 2,
    title: 'VARIABLE IDENTITY CRISIS',
    image: '/badges/badge_02.png',
    difficulty: 'Beginner',
    points: 100,
    description: 'Stark Suit HUD telemetry data types synchronized.'
  },
  3: {
    id: 3,
    title: 'THE INFINITE WEB LOOP',
    image: '/badges/badge_03.png',
    difficulty: 'Beginner',
    points: 100,
    description: 'Web-Shooter chrono matrix index boundary and loop patched.'
  },
  4: {
    id: 4,
    title: 'THE SCRAMBLED MESSAGE',
    image: '/badges/badge_04.png',
    difficulty: 'Beginner',
    points: 100,
    description: 'Oscorp network encrypted telemetry frequency cipher decoded.'
  },
  5: {
    id: 5,
    title: 'THE LOGIC TRAP',
    image: '/badges/badge_05.png',
    difficulty: 'Intermediate',
    points: 150,
    description: 'Spider-Verse multiversal dimensional portal registry repaired.'
  },
  6: {
    id: 6,
    title: 'THE LOST WEB DATABASE',
    image: '/badges/badge_06.png',
    difficulty: 'Intermediate',
    points: 150,
    description: 'Oscorp power grid database records and clusters restored.'
  },
  7: {
    id: 7,
    title: 'THE FUNCTION FAILURE',
    image: '/badges/badge_07.png',
    difficulty: 'Intermediate',
    points: 200,
    description: 'Quantum telemetry function invocation pipeline stabilized.'
  },
  8: {
    id: 8,
    title: 'THE MISSING MISSION FILE',
    image: '/badges/badge_08.png',
    difficulty: 'Intermediate',
    points: 200,
    description: 'Spider-Drone secure telemetry mission file recovered.'
  },
  9: {
    id: 9,
    title: 'THE MULTI-BUG OUTBREAK',
    image: '/badges/badge_09.png',
    difficulty: 'Hard',
    points: 250,
    description: 'Multithreaded neural sensor race conditions synchronized.'
  },
  10: {
    id: 10,
    title: 'SPIDER-VERSE SYSTEM RECOVERY',
    image: '/badges/badge_10.png',
    difficulty: 'Hard',
    points: 300,
    description: 'The Quantum Nexus Core stabilized. Spider-Verse saved!'
  }
};
