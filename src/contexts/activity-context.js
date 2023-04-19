import { createContext, useContext, useState } from 'react'

export const ActivityContext = createContext({});

// This activity context provider is used to store and keep track of all latest workspace activities,
// including launch app, update/delete instances, polling service.
// Latest activity of each instance will be shown in the side panel component. 

export const ActivityProvider = ({ children }) => {
    const [activityArray, setActivityArray] = useState([]);

    const addActivity = useCallback((newActivity) => {
        setActivityArray((oldActivityArray) => (
            [ newActivity, ...oldActivityArray ]
        ))
    }, [])

    const updateActivity = useCallback((newActivity) => {
        setActivityArray((oldActivityArray) => (
            [
                newActivity,
                ...oldActivityArray.filter((value) => value['sid'] !== newActivity['sid'])
            ]
        ))
    }, [])

    return (
        <ActivityContext.Provider
            value={{
                activity: activityArray,
                addActivity: addActivity,
                updateActivity: updateActivity
            }}>
            {children}
        </ActivityContext.Provider>
    )
}

export const useActivity = () => useContext(ActivityContext);