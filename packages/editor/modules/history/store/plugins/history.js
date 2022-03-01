import UndoStack from "../../utils/UndoStack";

export default function ({ store }) {
  if (store.$id !== "components") {
    return;
  }

  store.$subscribe((context) => {
    console.log("subscribe");
    console.log(context);
  });
}
