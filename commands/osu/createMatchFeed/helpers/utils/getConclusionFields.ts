import { MatchScore } from "../types";

export const getConclusionField = (matchScore: MatchScore) => {
  const winner = matchScore[0].score > matchScore[1].score ? 0 : 1;

  return {
    name: "",
    value: `**${matchScore[winner].user.username}** wins ${
      matchScore[winner].score
    } - ${matchScore[1 - winner].score}!`,
  };
};
