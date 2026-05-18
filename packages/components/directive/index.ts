import idCard from './idCard'
import phone from './phone'
import number from "./number"
import focus from "./focus"
import permission from "./permission";
const directives = {
  idCard,
  phone,
  number,
  focus,
  permission
}

export default (App) => {
  Object.keys(directives).forEach((key) => {
    App.directive(key, directives[key])
  })
}

