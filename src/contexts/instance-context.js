import React, { createContext, useContext, useState } from 'react'

export const InstanceContext = createContext({});

export const InstanceProvider = ({ children }) => {
    const [openedTabs, setTabs] = useState([]);

    const addOrDeleteInstanceTab = (action, app_id, tabIns = undefined) => {
        if (action === "add") {
            setTabs(prev => prev.concat(tabIns));
        }
        // Close its browser tab if an instance is deleted by a use.
        if (action === "close") {
            openedTabs.forEach((item) => {
                if (item.name.split("-")[0] === `${app_id}`) {
                    item.close();
                }
            });
            setTabs(prev => prev.filter(tab => tab.name.split("-")[0] !== `${app_id}`));
        }
    };

    return (
        <InstanceContext.Provider value={{
            addOrDeleteInstanceTab
        }}>
            {children}
        </InstanceContext.Provider>
    )
}

export const useInstance = () => useContext(InstanceContext);