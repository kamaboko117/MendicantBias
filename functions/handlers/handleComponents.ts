import { Mendicant } from "../../classes/Mendicant";
import components from "../../components/index";

export default (mendicant: Mendicant) => {
  mendicant.handleComponents = async () => {
    const { buttons, selectMenus, modals } = mendicant;

    //set buttons
    const buttonsList = components.buttons;
    Object.keys(buttonsList).forEach((key) => {
      const button = buttonsList[key as keyof typeof buttonsList];
      buttons.set(button.data.name, button);
    });

    //set selectMenus
    const selectMenusList = components.selectMenus;
    Object.keys(selectMenusList).forEach((key) => {
      const menu = selectMenusList[key as keyof typeof selectMenusList];
      selectMenus.set(menu.data.name, menu);
    });

    //set modals
    const modalsList = components.modals;
    Object.keys(modalsList).forEach((key) => {
      const modal = modalsList[key as keyof typeof modalsList];
      modals.set(modal.data.name, modal);
    });
  };
};
