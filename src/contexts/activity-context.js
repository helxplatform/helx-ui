import { createContext, useContext, useState } from 'react'

export const ActivityContext = createContext({});

// This activity context provider is used to store and keep track of all latest workspace activities,
// including launch app, update/delete instances, polling service.
// Latest activity of each instance will be shown in the side panel component. 

export const ActivityProvider = ({ children }) => {
    const [activityArray, setActivityArray] = useState([]);

    const addActivity = new_activity => {
        let newActivityArray = [...activityArray];
        newActivityArray.unshift(new_activity);
        setActivityArray(newActivityArray)
    }

    const updateActivity = new_activity => {
        let filteredArray = [...activityArray];
        filteredArray = activityArray.filter(value => { return value['sid'] !== new_activity['sid'] })
        filteredArray.unshift(new_activity);
        setActivityArray(filteredArray)
    }

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