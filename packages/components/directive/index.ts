import idCard from './idCard'
import phone from './phone'
import number from "./number"
import focus from "./focus"
const directives = {
  idCard,
  phone,
  number,
  focus
}

export default (App) => {
  Object.keys(directives).forEach((key) => {
    App.directive(key, directives[key])
  })
}

