import {createContext, useContext, useState, ReactNode} from 'react';

interface UseAggregateContextType {
    calcOnAggregate: boolean;
    setCalcOnAggregate: (value: boolean) => void;
}

const CalcOnAggregateContext = createContext<UseAggregateContextType | undefined>(undefined);

export const CalcOnAggregateProvider = ({children}: { children: ReactNode }) => {
    const [calcOnAggregate, setCalcOnAggregate] = useState<boolean>(true);

    return (
        <CalcOnAggregateContext.Provider value={{calcOnAggregate: calcOnAggregate, setCalcOnAggregate: setCalcOnAggregate}}>
            {children}
        </CalcOnAggregateContext.Provider>
    );
};

export const useCalcOnAggregate = () => {
    const context = useContext(CalcOnAggregateContext);
    if (context === undefined) {
        throw new Error('useUseAggregate must be used within a UseAggregateProvider');
    }
    return context;
};