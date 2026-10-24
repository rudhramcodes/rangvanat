import {createContext,useContext} from 'react';
export const formatPrice=amount=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(Number(amount)||0);
const StoreContext=createContext(null);
export function useStore(){const value=useContext(StoreContext);if(!value)throw Error('useStore requires StoreProvider');return value;}
export default StoreContext;
