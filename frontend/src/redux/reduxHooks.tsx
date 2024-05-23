import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';
import { Dispatch, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useAppDispatch = (): ThunkDispatch<any, undefined, UnknownAction> &
  Dispatch<UnknownAction> => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
