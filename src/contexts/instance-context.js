import React, { createContext, useContext, useState } from 'react'
import axios from 'axios';
import { useEnvironment } from './environment-context';

export const InstanceContext = createContext({});

export const InstanceProvider = ({ children }) => {
    const { helxAppstoreUrl } = useEnvironment();
    const [openedTabs, setTabs] = useState([]);

    const addOrDeleteInstanceTab = (action, app_id, tabIns = undefined) => {
        if (action === "add") {
            setTabs(prev => prev.concat(tabIns));
        }
        if (action === "close") {
            openedTabs.map((item) => {
                if (item.name.split("-")[0] === `${app_id}`) {
                    item.close();
                };
            });
            setTabs(prev => prev.filter(tab => tab.name.split("-")[0] != `${app_id}`));
        };
    };

    const loadInstances = () => {
        return axios.get(`${helxAppstoreUrl}/api/v1/instances`)
    }

    const stopInstance = (app_id) => {
        return axios.delete(`${helxAppstoreUrl}/api/v1/instances/${app_id}`);
    }

    const updateInstance = (app_id, workspace, cpu, gpu, memory) => {
        const data = {}
        data["cpu"] = `${cpu}`;
        data["gpu"] = `${gpu}`;
        if (memory.length > 0) {
            data["memory"] = `${memory}`;
        }
        if (workspace.length > 0) {
            data["labels"] = { "app-name": `${workspace}` };
        }
        return axios.patch(`${helxAppstoreUrl}/api/v1/instances/${app_id}/`, data)
    }

    return (
        <InstanceContext.Provider value={{
            loadInstances, stopInstance, updateInstance, addOrDeleteInstanceTab
        }}>
            {children}
        </InstanceContext.Provider>
    )
}

export const useInstance = () => useContext(InstanceContext);