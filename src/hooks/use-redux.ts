import { useAppDispatch, useAppSelector } from "@/store";
import { resetStore, persistor } from "@/store";

export const useRedux = () => {
    const dispatch = useAppDispatch();
    const selector = useAppSelector;

    const resetReduxStore = () => {
        persistor.purge();
        dispatch(resetStore());
    };

    return {
        dispatch,
        selector,
        resetReduxStore
    };
};
