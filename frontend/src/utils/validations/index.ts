export const validationMethodsWithoutParams = {
  isRequired(value: string) {
    return !value.trim() ? { status: false, errorMessage: "Обязательное поле!" } : { status: true };
  },
  isNumber(value: string) {
    let regex = /^\d+$/;
    return !(regex.test(value)) ? { status: false, errorMessage: "Поле должно содержать только цифры" } : { status: true };
  },
  isNumberWithColon(value: string) {
    let regex = /^[0-9:]+$/gi;
    return !(regex.test(value)) ? { status: false, errorMessage: "Поле должно содержать цифры и двоеточия" } : { status: true };
  },
  isEmail(value: string) {
    let regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,24})+$/;
    return !(regex.test(value)) ? { status: false, errorMessage: "Неверный email" } : { status: true };
  },
}

export const validationMethodsWithParams = {
  minLength(value: string, minLength: number) {
    return (value.length < minLength) ? { status: false, errorMessage: `Поле должно содержать не менее ${minLength} символов` } : { status: true };
  },
  maxLength(value: string, maxLength: number) {
    return (value.length > maxLength) ? { status: false, errorMessage: `Поле должно содержать не более ${maxLength} символов` } : { status: true };
  },
  min(value: string, min: number) {
    return (+value < min) ? { status: false, errorMessage: `Число не может быть меньше ${min}` } : { status: true };
  },
  max(value: string, max: number) {
    return (+value > max) ? { status: false, errorMessage: `Число не может быть больше ${max}` } : { status: true };
  },
}

export const validationMethodsWithDates = {
  isDateInFuture(date1: number, date2: number) {
    return (date2 - date1) > 0 ? { status: false, errorMessage: "Дата окончания не может быть раньше даты начала" } : { status: true };
  },
}

export const validationMethods = {
  ...validationMethodsWithoutParams,
  ...validationMethodsWithParams,
  ...validationMethodsWithDates
}
