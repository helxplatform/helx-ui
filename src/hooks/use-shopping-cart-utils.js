const createConceptCartItem = (concept, fromSearch) => ({
  id: concept.id,
  name: `${concept.name} (${concept.type})`,
  description: concept.description,
  price: null,
  tax: null,
  quantity: 1,
  from: { type: "search", value: fromSearch },
  bucketId: "concepts",
  item: concept,
})
const createStudyCartItem = (study, fromConcept) => ({
  id: study.c_id,
  name: study.c_name,
  nameSecondary: `(${ study.elements.length } variable${study.elements.length !== 1 ? "s" : ""})`,
  price: null,
  tax: null,
  quantity: 1,
  from: { type: "concept", value: fromConcept },
  bucketId: "studies",
  item: study,
})
const createVariableCartItem = (variable, fromStudy) => ({
  id: variable.id,
  name: variable.name,
  description: variable.description,
  price: null,
  tax: null,
  quantity: 1,
  from: { type: "study", value: fromStudy },
  bucketId: "variables",
  item: variable,
})
const createCdeCartItem = (cde, fromConcept) => ({
  id: cde.id,
  name: cde.name,
  description: cde.description,
  price: null,
  tax: null,
  quantity: 1,
  from: { type: "concept", value: fromConcept },
  bucketId: "cdes",
  item: cde,
});

export const useShoppingCartUtilities = () => {
  return {
      createConceptCartItem,
      createStudyCartItem,
      createVariableCartItem,
      createCdeCartItem,
  }
}