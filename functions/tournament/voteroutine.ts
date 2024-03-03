import { Mendicant } from "../../classes/Mendicant.js";
import { executeVote } from "../../components/buttons/tourney";
import { executeVote as executeChallongeVote } from "../../components/buttons/challongeTourney";

export default (mendicant: Mendicant) => {
  mendicant.voteRoutine = async function () {
    while (69) {
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
