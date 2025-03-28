/**
 * Implements the ELO rating system for calculating new ratings after a match
 * Based on the chess ELO system, adapted for heritage site voting
 */

// K-factor determines how much a single result affects ratings
// Higher values create more volatile ratings
const K_FACTOR = 32;

/**
 * Calculate the expected score (win probability) of a player
 * 
 * @param ratingA Rating of the first site
 * @param ratingB Rating of the second site
 * @returns Expected score (between 0 and 1)
 */
export function calculateExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculate the new ELO rating for a participant based on their 
 * current rating, expected score, and actual score
 * 
 * @param currentRating Current ELO rating
 * @param expectedScore Expected score (probability of winning)
 * @param actualScore Actual score (1 for win, 0 for loss)
 * @returns New ELO rating
 */
export function calculateNewRating(
  currentRating: number, 
  expectedScore: number, 
  actualScore: number
): number {
  return Math.round(currentRating + K_FACTOR * (actualScore - expectedScore));
}

/**
 * Updates the ratings for two sites after a vote
 * 
 * @param winnerRating Current rating of the winning site
 * @param loserRating Current rating of the losing site
 * @returns Object containing new ratings for both sites
 */
export function updateRatings(winnerRating: number, loserRating: number): {
  newWinnerRating: number;
  newLoserRating: number;
} {
  // Calculate expected scores
  const expectedWinnerScore = calculateExpectedScore(winnerRating, loserRating);
  const expectedLoserScore = calculateExpectedScore(loserRating, winnerRating);
  
  // Calculate new ratings
  const newWinnerRating = calculateNewRating(winnerRating, expectedWinnerScore, 1);
  const newLoserRating = calculateNewRating(loserRating, expectedLoserScore, 0);
  
  return {
    newWinnerRating,
    newLoserRating
  };
}
