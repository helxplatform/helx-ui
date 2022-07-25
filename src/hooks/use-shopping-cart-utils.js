const createConceptCartItem = (concept, fromSearch) => ({
  id: concept.id,
  name: `${concept.name} (${concept.type})`,
  description: concept.description,
  from: { type: "search", value: fromSearch },
  bucketId: "concepts",
  item: concept,
})
const createStudyCartItem = (study, fromConcept) => ({
  id: study.c_id,
  name: study.c_name,
  nameSecondary: `(${ study.elements.length } variable${study.elements.length !== 1 && "s"})`,
  from: { type: "concept", value: fromConcept },
  bucketId: "studies",
  item: study,
})
const createVariableCartItem = (variable, fromStudy) => ({
  id: variable.id,
  name: variable.name,
  description: variable.description,
  from: { type: "study", value: fromStudy },
  bucketId: "variables",
  item: variable,
})

export const useShoppingCartUtilities = () => {
  return {
      createConceptCartItem,
      createStudyCartItem,
      createVariableCartItem
  }
}