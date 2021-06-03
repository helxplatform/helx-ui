import React, { createContext, useContext } from 'react'
import axios from 'axios';
import { useEnvironment } from './environment-context';

export const InstanceContext = createContext({});

export const InstanceProvider = ({ children }) => {
    const { helxAppstoreUrl } = useEnvironment();

    const loadInstances = () => {
        return axios.get(`${helxAppstoreUrl}/api/v1/instances`)
    }

    const stopInstance = (app_id) => {
        return axios.delete(`${helxAppstoreUrl}/api/v1/instances/${app_id}`);
    }

    const updateInstance = (app_id, workspace, cpu, memory) => {
        const data = {}
        if (cpu.length > 0) {
            data["cpu"] = `${cpu}`;
        }
        if (memory.length > 0) {
            data["memory"] = `${memory}M`;
        }
        if (workspace.length > 0) {
            data["labels"] = { "app-name": `${workspace}` };
        }
        return axios.patch(`${helxAppstoreUrl}/api/v1/instances/${app_id}/`, data)
    }

    return (
        <InstanceContext.Provider value={{
            loadInstances, stopInstance, updateInstance
        }}>
            {children}
        </InstanceContext.Provider>
    )
}

export const useInstance = () => useContext(InstanceContext);