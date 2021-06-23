import React, { createContext, useContext, useState } from 'react'
import { useEnvironment } from './environment-context';

export const ActivityContext = createContext({});

export const ActivityProvider = ({ children }) => {
    const [activityArray, setActivityArray] = useState([]);

    const addActivity = new_activity => {
        let newActivityArray = [...activityArray];
        newActivityArray.unshift(new_activity);
        setActivityArray(newActivityArray)
    }

    return(
        <ActivityContext.Provider
            value={{
                activity: activityArray,
                addActivity: addActivity
            }}>
            {children}
        </ActivityContext.Provider>
    )
}

export const useActivity = () => useContext(ActivityContext);