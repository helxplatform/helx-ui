import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios';
import { useEnvironment } from './environment-context';
import { useActivity } from './activity-context';

export const InstanceContext = createContext({});

export const InstanceProvider = ({ children }) => {
    const { helxAppstoreUrl } = useEnvironment();
    const { addActivity, updateActivity } = useActivity();
    const [openedTabs, setTabs] = useState([]);

    const pollingInstance = (app_id, sid, app_url, app_name) => {
        let ready = false;
        const decoded_url = decodeURIComponent(app_url);

        while (!ready) {
            const pollingResult = async () => await axios.get(decoded_url)
                .then(response => {
                    if (response.status == 200) {
                        ready = true;
                        let newActivity = {
                            'sid': sid,
                            'app_name': app_name,
                            'status': 'success',
                            'timestamp': new Date(),
                            'message': `${app_name} is up and ready for use.`
                        }
                        updateActivity(newActivity);
                        const connect_tab_ref = `${sid}-tab`
                        const connect_tab = window.open(`${decoded_url}`, connect_tab_ref);
                        window.focus();
                        addOrDeleteInstanceTab("add", app_id, connect_tab);
                    }
                })
                .catch((e) => {
                    console.log(e);
                });
            pollingResult();
        }
    }

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
            loadInstances, stopInstance, updateInstance, addOrDeleteInstanceTab, pollingInstance
        }}>
            {children}
        </InstanceContext.Provider>
    )
}

export const useInstance = () => useContext(InstanceContext);