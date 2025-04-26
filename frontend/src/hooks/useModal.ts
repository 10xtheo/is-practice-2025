import { useActions } from "./useActions";
import { useTypedSelector } from "./useTypedSelector";

export const useModal = () => {
  const modalsData = useTypedSelector(({ modals }) => modals);
  const {
    openModalCreate,
    openModalDayInfo,
    openModalEdit,
    openModalEditCalendar,
    closeModalCreate,
    closeModalDayInfo,
    closeModalEdit,
    closeModalEditCalendar
  } = useActions();

  return {
    ...modalsData,
    openModalCreate,
    openModalDayInfo,
    openModalEdit,
    openModalEditCalendar,
    closeModalCreate,
    closeModalDayInfo,
    closeModalEdit,
    closeModalEditCalendar
  };
}