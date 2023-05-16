//import handlers
import handlers from "./handlers/index.js";
import tournament from "./tournament/index.js";

export default {
  ...handlers,
  ...tournament,
};
