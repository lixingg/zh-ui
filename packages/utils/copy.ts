import { ElNotification } from "element-plus";

export default (text: string): void => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      ElNotification({
        title: "Success",
        message: "Copied",
        type: "success",
      });
    })
    .catch((err) => {
      ElNotification({
        title: "Error",
        message: err,
        type: "warning",
      });
    });
};
