/**
 * Called whenever the brush effect is used to zoom in on histogram
 */
export function updateStudyResults(filtered_variables, studyResultsForDisplay) {
    // Determine the studies that should be displayed in table
    const studiesInFilter = [...new Set(filtered_variables.map(obj => obj.study_name))]
    const studyResultsFiltered = studyResultsForDisplay.filter(obj => {
        return studiesInFilter.includes(obj.c_name)
    })

    // Update how variables are displayed under studies depending on whether they were filtered within the histogram
    const indicesForFilteredVariables = filtered_variables.map(obj => obj.indexPos)
    const studyResultsWithVariablesUpdated = []
    const filteredVarsInStudies = []
    studyResultsFiltered.forEach(study => {
        const updatedStudy = Object.assign({}, study);
        const updatedVariables = []
        study.elements.forEach(variable => {
            const indexForVariableInStudy = variable.indexPos;
            const studyVarInFilteredVars = indicesForFilteredVariables.includes(indexForVariableInStudy)

            if (studyVarInFilteredVars) {
                filteredVarsInStudies.push(indexForVariableInStudy)
                variable.withinFilter = true
            } else {
                variable.withinFilter = false
            }
            updatedVariables.push(variable)
        })
        updatedStudy["elements"] = updatedVariables
        studyResultsWithVariablesUpdated.push(updatedStudy)
    })

    return studyResultsWithVariablesUpdated;
}


/**
 * Helper function called from startOverHandler().
 *
 * The withinFilter property on each variable determines how the variable row is
 * displayed within the Studies table when the histogram brush filter/zoom function
 * is active.
 *
 * This function resets the  the withinFilter property back to none so styles are
 * dropped.
 */
export function resetFilterPropertyToNone(variableStudyResults) {
    return variableStudyResults.map(study => {
        const updatedStudy = Object.assign({}, study);
        const updatedVariables = []
        study.elements.forEach(variable => {
            variable.withinFilter = "none"
            updatedVariables.push(variable)
        })
        updatedStudy["elements"] = updatedVariables

        return updatedStudy;
    })
}