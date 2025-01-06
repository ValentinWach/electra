import {createContext, useContext, useState, ReactNode, useEffect} from 'react';

interface UseAggregateContextType {
    calcOnAggregate: boolean;
    setCalcOnAggregate: (value: boolean) => void;
}

const CalcOnAggregateContext = createContext<UseAggregateContextType | undefined>(undefined);

export const CalcOnAggregateProvider = ({children}: { children: ReactNode }) => {
    // Initialize from localStorage if available, otherwise default to true
    const [calcOnAggregate, setCalcOnAggregate] = useState<boolean>(() => {
        const saved = localStorage.getItem('calcOnAggregate');
        return saved !== null ? JSON.parse(saved) : true;
    });

    // Save to localStorage whenever the value changes
    useEffect(() => {
        localStorage.setItem('calcOnAggregate', JSON.stringify(calcOnAggregate));
    }, [calcOnAggregate]);

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