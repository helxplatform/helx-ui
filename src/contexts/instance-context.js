import React, { createContext, useContext, useEffect, useState } from 'react'
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
        return axios.patch(`${helxAppstoreUrl}/api/v1/instances/${app_id}/`,{
            cpu: `${cpu}`,
            memory: `${memory}M`,
            labels: {'app-name': `${workspace}`},
            },
            )
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