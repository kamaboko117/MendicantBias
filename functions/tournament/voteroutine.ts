import type { Mendicant } from "../../classes/Mendicant.js";
import { executeVote as executeChallongeVote } from "../../components/buttons/challongeTourney";
import { executeVote } from "../../components/buttons/tourney";

export default (mendicant: Mendicant) => {
  mendicant.voteRoutine = async function () {
    while (true) {
      //sleep 2seconds
      await new Promise((r) => setTimeout(r, 2000));
      if (!this.voteQueue.isEmpty) {
        while (!this.voteQueue.isEmpty) {
          await executeVote(this.voteQueue.dequeue());
        }
      }
      if (!this.challongeVoteQueue.isEmpty) {
        while (!this.challongeVoteQueue.isEmpty) {
          await executeChallongeVote(this.challongeVoteQueue.dequeue());
        }
      }
    }
  };
};
