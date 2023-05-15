import components from "../../components/index.js";

export default (client) => {
  client.handleComponents = async () => {
    const { buttons, selectMenus, modals } = client;

    //set buttons
    const buttonsList = components.buttons;
    Object.keys(buttonsList).forEach((key) => {
      const button = buttonsList[key];
      buttons.set(button.data.name, button);
    });

    //set selectMenus
    const selectMenusList = components.selectMenus;
    Object.keys(selectMenusList).forEach((key) => {
      const menu = selectMenusList[key];
      selectMenus.set(menu.data.name, menu);
    });

    //set modals
    const modalsList = components.modals;
    Object.keys(modalsList).forEach((key) => {
      const modal = modalsList[key];
      modals.set(modal.data.name, modal);
    });
  };
};
